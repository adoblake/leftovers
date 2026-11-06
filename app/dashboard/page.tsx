import { getDataMode } from '@/lib/runtime-config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import { Login } from '@/components/Login';
import { RecordEditor } from '@/components/RecordEditor';
import { Dashboard } from '@/components/Dashboard';
import { SponsorManager } from '@/components/SponsorManager';
export const dynamic = 'force-dynamic';
export default async function Page() {
  if (getDataMode() !== 'supabase') return <main id="main" className="page-main login-page"><div className="eyebrow">PUBLIC DEMO</div><h1>Explore the pilot workspace.</h1><p>Staff sign-in and private records are disabled in this demonstration. The sample dashboard uses clearly labeled fictional data.</p><Link className="button" href="/demo">View the demo dashboard →</Link></main>;
  const token = (await cookies()).get('leftovers_session')?.value;
  if (token) {
    try {
      const client = db(token);
      const { data: { user } } = await client.auth.getUser(token);
      if (user) {
        const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single();
        if (profile && ['admin', 'coordinator', 'analyst'].includes(profile.role)) {
          const results = await Promise.all([
            client.from('interests').select('*').order('created_at', { ascending: false }).limit(200),
            client.from('recipient_partners').select('id,organization,status,zip'),
            client.from('pickups').select('*'), client.from('operating_costs').select('*'),
            client.from('sponsors').select('id,public_name,published'),
          ]);
          if (results.some(result => result.error)) return <main id="main" className="page-main"><h1>Records unavailable</h1><p>Apply all database migrations and check your assigned permissions before retrying.</p></main>;
          const interests = results[0].data || [];
          return <><Dashboard interests={interests} partners={results[1].data || []} pickups={results[2].data || []} costs={results[3].data || []} />
            {profile.role !== 'analyst' && <div className="page-main"><RecordEditor admin={profile.role === 'admin'} interests={interests.map(row => ({ id: row.id, organization: row.organization, kind: row.kind }))} pickups={(results[2].data || []).map(row => ({ id: row.id }))} />
              {profile.role === 'admin' && <SponsorManager inquiries={interests.filter(row => row.kind === 'sponsor').map(row => ({ id: row.id, organization: row.organization, status: row.status, recognition_consent: row.recognition_consent }))} sponsors={results[4].data || []} />}
            </div>}
          </>;
        }
      }
    } catch { /* Fail closed. */ }
  }
  return <main id="main" className="page-main login-page"><div className="eyebrow">AUTHORIZED STAFF ONLY</div><h1>Pilot workspace</h1><p>Sign in with your administrator-provisioned account. Access is restricted by role. Sessions expire after one hour.</p><Login /><p>No account? Explore the <Link href="/demo">public dashboard with fictional demo data →</Link></p><p className="privacy-note">Local demo submissions stay private on this machine. Configure Supabase to use authenticated records.</p></main>;
}
