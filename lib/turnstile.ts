import { getDataMode } from './runtime-config';

type Verification = { ok: true } | { ok: false; reason: 'configuration' | 'missing' | 'invalid' | 'unavailable' };
export async function verifyInterestChallenge(token: string, hostname: string): Promise<Verification> {
  const enabled = getDataMode() === 'supabase' && (process.env.NODE_ENV === 'production' || Boolean(process.env.TURNSTILE_SECRET_KEY));
  if (!enabled) return { ok: true };
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return { ok: false, reason: 'configuration' };
  if (!token) return { ok: false, reason: 'missing' };
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, reason: 'unavailable' };
    const data = await response.json();
    return data.success === true && data.hostname === hostname && data.action === 'interest' ? { ok: true } : { ok: false, reason: 'invalid' };
  } catch { return { ok: false, reason: 'unavailable' }; }
}
