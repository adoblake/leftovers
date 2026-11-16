import type { Metadata } from 'next';
import Link from 'next/link';
import { FormPage } from '@/components/FormPage';
import { SponsorSection } from '@/components/SponsorSection';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Sponsor or invest' };
export const revalidate = 300;

export default function Page() {
  return <FormPage kind="sponsor" title="Back the first site." description="LEFTOVERS needs backers for its first Phoenix site: funding, vehicles, cold storage, a building and professional help. Tell us what you could bring.">
    <div className="actions sponsor-top-actions"><a className="button" href="#sponsor-inquiry">Start a backer conversation <Icon name="arrow" width="18" height="18" /></a><Link className="text-link" href="/mission">Read the mission <Icon name="arrow" width="16" height="16" /></Link></div>
    <div className="sponsor-opportunities"><article><Icon name="box" width="28" height="28" /><h2>Practical resources</h2><p>Vehicles for pickups, cold storage, market equipment or a building for the first site.</p></article><article><Icon name="leaf" width="28" height="28" /><h2>Startup funding</h2><p>Cover the first year of crew wages, legal setup and rent before the businesses pay their way. Terms agreed separately.</p></article><article><Icon name="people" width="28" height="28" /><h2>Local expertise</h2><p>Employment, housing and food law, payroll, accounting, real estate and Phoenix connections.</p></article></div>
    <SponsorSection compact />
    <div className="notice"><strong>A conversation, not a payment.</strong> This form does not collect money or create a sponsorship agreement. No tax benefits, advertising results, or operational pickup availability are promised.</div>
    <h2 className="sponsor-inquiry-heading" id="sponsor-inquiry">Let’s talk about what you can bring.</h2>
  </FormPage>;
}
