import { db } from './supabase';
import { getDataMode } from './runtime-config';

export type PublicSponsor = { id: string; public_name: string; website: string; public_description: string; support_area: string };
export async function getPublicSponsors(): Promise<PublicSponsor[]> {
  if (getDataMode() !== 'supabase') return [];
  try {
    // Anonymous key plus RLS: this query cannot read private inquiry contacts.
    const { data, error } = await db().from('sponsor_directory').select('id,public_name,website,public_description,support_area').order('public_name').limit(24);
    if (error) return [];
    return data || [];
  } catch { return []; }
}
