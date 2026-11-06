import Link from 'next/link';
import { InterestForm } from './InterestForm';
import { Icon } from './Icon';
import { RegistrationShare } from './RegistrationShare';
import { getDataMode } from '@/lib/runtime-config';
import type { InterestKind } from '@/lib/validation';

export function FormPage({ kind, title, description, topic = 'general', children }: { kind: InterestKind; title: string; description: string; topic?: 'general' | 'partner' | 'privacy'; children?: React.ReactNode }) {
  const mode = getDataMode();
  return <main id="main" className="page-main form-page">
    <Link className="breadcrumb" href="/get-involved"><Icon name="arrow" width="14" height="14" /> Ways to get involved</Link>
    <div className="form-page-intro"><div className="eyebrow">PHOENIX PILOT / {kind === 'contact' ? 'LET’S CONNECT' : 'EXPRESSIONS OF INTEREST'}</div><h1>{title}</h1><p className="lead">{description}</p></div>
    {children}
    <div className="form-layout"><div>{mode !== 'supabase' && <div className="demo-notice"><Icon name="leaf" width="19" height="19" /><p>{mode === 'preview' ? <><strong>You’re exploring a public demo.</strong> Use fictional details only. Responses are validated, but not saved or sent.</> : <><strong>You’re exploring the local demo.</strong> Submissions stay on this machine; no team is notified. Please use fictional details.</>}</p></div>}<InterestForm kind={kind} topic={topic} preview={mode === 'preview'} turnstileSiteKey={mode === 'supabase' ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY : undefined} /></div>
      <aside className="form-side" aria-label="Before you submit"><Icon name="shield" width="32" height="32" /><h2>{kind === 'sponsor' ? 'A conversation comes first.' : 'A thoughtful first step.'}</h2><p>{kind === 'sponsor' ? 'Explore how your organization could support a responsible Phoenix pilot. No contribution is agreed by submitting this form.' : 'We’re planning a responsible food recovery pilot with Phoenix, for Phoenix.'}</p><h3>What happens next?</h3><ol><li>{mode === 'preview' ? 'Try the form with fictional information. No response is saved.' : 'Your information is saved for review.'}</li><li>Authorized staff can explore fit and capacity in a configured pilot environment.</li><li>{kind === 'sponsor' ? 'Public recognition requires your permission, review, and a confirmed agreement.' : 'Any future activity requires explicit approval.'}</li></ol><div className="notice">{kind === 'sponsor' ? <><strong>No payment collected.</strong> Sponsorship terms and any contribution would be agreed separately. This is not a contract.</> : <><strong>Not a pickup booking.</strong> Pickups are not operational. Food safety and regulatory review are required before launch.</>}</div><Link className="text-link" href="/how-it-works">Read about the process <Icon name="arrow" width="14" height="14" /></Link>{kind === 'donor' && <RegistrationShare />}</aside>
    </div>
  </main>;
}
