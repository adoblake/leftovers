import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDataMode, isAllowedOrigin } from '@/lib/runtime-config';
import { db } from '@/lib/supabase';

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('publish'), interest_id: z.uuid(), public_description: z.string().trim().min(10).max(280), confirmed: z.literal(true) }),
  z.object({ action: z.literal('unpublish'), id: z.uuid() }),
]);
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get('origin'))) return NextResponse.json({ message: 'Origin not allowed.' }, { status: 403 });
  const token = (await cookies()).get('leftovers_session')?.value;
  if (!token) return NextResponse.json({ message: 'Sign in required.' }, { status: 401 });
  if (getDataMode() !== 'supabase') return NextResponse.json({ message: 'Private record changes are disabled in demonstration mode.' }, { status: 503 });
  try {
    const client = db(token);
    const { data: { user } } = await client.auth.getUser(token);
    if (!user) return NextResponse.json({ message: 'Session expired.' }, { status: 401 });
    const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ message: 'Only administrators can manage public sponsorship acknowledgments.' }, { status: 403 });
    const parsed = inputSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ message: 'Choose a reviewed inquiry, provide a short acknowledgment, and confirm the agreement.' }, { status: 400 });
    const input = parsed.data;
    let result;
    if (input.action === 'publish') {
      const { data: source, error } = await client.from('interests').select('id,kind,organization,sponsor_website,support_type,recognition_consent,status').eq('id', input.interest_id).single();
      if (error || !source || source.kind !== 'sponsor' || !source.recognition_consent || source.status !== 'Approved for planning') return NextResponse.json({ message: 'A reviewed sponsorship inquiry with explicit recognition permission is required.' }, { status: 400 });
      result = await client.from('sponsors').upsert({ source_interest_id: source.id, public_name: source.organization, website: source.sponsor_website, support_area: source.support_type, public_description: input.public_description, agreement_confirmed: true, published: true }, { onConflict: 'source_interest_id' }).select('id');
    } else {
      result = await client.from('sponsors').update({ published: false }).eq('id', input.id).select('id');
    }
    if (result.error || !result.data?.length) throw new Error('Publication failed');
    revalidatePath('/'); revalidatePath('/sponsors');
    return NextResponse.json({ message: input.action === 'publish' ? 'Approved organizational acknowledgment published. Personal contact information remains private.' : 'Acknowledgment removed from the public directory.' });
  } catch { return NextResponse.json({ message: 'Unable to update public sponsorship. Check the record and database setup.' }, { status: 503 }); }
}
