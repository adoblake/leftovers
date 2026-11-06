import { NextRequest, NextResponse } from 'next/server';
import { interestSchema, timingValid } from '@/lib/validation';
import { db } from '@/lib/supabase';
import { mkdir, appendFile } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { verifyInterestChallenge } from '@/lib/turnstile';
import { getDataMode, isAllowedOrigin } from '@/lib/runtime-config';

export const runtime = 'nodejs';
const limits = new Map<string, { count: number; reset: number }>();
const topicLabels = { general: 'General inquiry', partner: 'Recipient partnership', privacy: 'Privacy request' };

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return NextResponse.json({ message: 'Origin not allowed.' }, { status: 403 });
  if (Number(req.headers.get('content-length') || 0) > 16000) return NextResponse.json({ message: 'Submission too large.' }, { status: 413 });

  const key = createHash('sha256').update(req.headers.get('x-forwarded-for')?.split(',')[0] || 'local').digest('hex');
  const now = Date.now();
  if (limits.size > 10000) for (const [entry, value] of limits) if (value.reset < now) limits.delete(entry);
  const limit = limits.get(key);
  if (limit && limit.reset > now && limit.count >= 5) return NextResponse.json({ message: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429, headers: { 'Retry-After': '900' } });
  limits.set(key, { count: limit && limit.reset > now ? limit.count + 1 : 1, reset: limit && limit.reset > now ? limit.reset : now + 900000 });

  let raw: unknown;
  try {
    const text = await req.text();
    if (Buffer.byteLength(text, 'utf8') > 16000) return NextResponse.json({ message: 'Submission too large.' }, { status: 413 });
    raw = JSON.parse(text);
  } catch { return NextResponse.json({ message: 'Please send a valid form submission.' }, { status: 400 }); }

  const parsed = interestSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return NextResponse.json({ message: 'Check the highlighted fields and try again.', fields }, { status: 400 });
  }
  const { website, startedAt, consent, topic, turnstileToken, ...data } = parsed.data;
  if (!timingValid(startedAt)) return NextResponse.json({ message: 'Please take a moment to review the form, then submit again.' }, { status: 400 });
  const mode = getDataMode();
  if (mode === 'preview') return NextResponse.json({ stored: false, message: 'Demo response validated. Nothing has been saved or sent to a team. No registration or pickup request was created.' });
  const challenge = await verifyInterestChallenge(turnstileToken, new URL(req.headers.get('origin')!).hostname);
  if (!challenge.ok) return NextResponse.json({ message: challenge.reason === 'configuration' ? 'Interest collection is not open yet. Please check back soon.' : challenge.reason === 'unavailable' ? 'The spam check is temporarily unavailable. Your response has not been saved. Please try again later.' : 'Please complete or refresh the spam check, then try again.' }, { status: ['configuration','unavailable'].includes(challenge.reason) ? 503 : 400 });
  const row = {
    ...data, id: randomUUID(),
    organization: data.organization || 'Individual inquiry',
    zip: data.zip || null,
    notes: data.kind === 'contact' ? `[${topicLabels[topic]}]\n${data.notes}` : data.notes,
    status: 'Interest received', consented_at: new Date().toISOString(), created_at: new Date().toISOString(),
  };
  try {
    if (mode === 'supabase') {
      const { error } = await db(undefined, true).from('interests').insert(row);
      if (error) throw error;
    } else {
      if (process.env.NODE_ENV === 'production') throw new Error('Production requires Supabase');
      await mkdir('.data', { recursive: true, mode: 0o700 });
      await appendFile('.data/interest.jsonl', JSON.stringify(row) + '\n', { mode: 0o600 });
    }
    return NextResponse.json({ message: mode === 'supabase'
      ? data.kind === 'sponsor' ? 'Your sponsorship inquiry has been saved for review. No contribution, agreement, or public acknowledgment is confirmed.' : data.kind === 'contact' ? 'Your message has been received for review. Thank you for helping shape the pilot.' : 'Your interest has been received for review. This is not a confirmed pickup.'
      : 'Demo submission saved locally. This is a local prototype; no operational team has been notified.' }, { status: 201 });
  } catch { return NextResponse.json({ message: 'Unable to save your submission. Please try again later.' }, { status: 503 }); }
}
