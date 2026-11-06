import type { Metadata } from 'next';
import Link from 'next/link';
import { FormPage } from '@/components/FormPage';
import { SponsorSection } from '@/components/SponsorSection';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Support the Phoenix pilot' };
export const revalidate = 300;

export default function Page() {
  return <FormPage kind="sponsor" title="Help possibility take root." description="There’s room to help build the Phoenix pilot. Tell us what your business, organization, or community group could bring to the table.">
    <div className="actions sponsor-top-actions"><a className="button" href="#sponsor-inquiry">Start a sponsorship conversation <Icon name="arrow" width="18" height="18" /></a><Link className="text-link" href="/mission">Read the mission <Icon name="arrow" width="16" height="16" /></Link></div>
    <div className="sponsor-opportunities"><article><Icon name="box" width="28" height="28" /><h2>Practical resources</h2><p>Explore transport, food-safe storage, equipment, or other in-kind support that could make a future pilot feasible.</p></article><article><Icon name="leaf" width="28" height="28" /><h2>Pilot funding</h2><p>Discuss support for reviewed pilot needs. Amounts, terms, and recognition would be agreed separately.</p></article><article><Icon name="people" width="28" height="28" /><h2>Local expertise</h2><p>Bring professional skills, connections, and knowledge of Phoenix to a responsible planning effort.</p></article></div>
    <SponsorSection compact />
    <div className="notice"><strong>A conversation, not a payment.</strong> This form does not collect money or create a sponsorship agreement. No tax benefits, advertising results, or operational pickup availability are promised.</div>
    <h2 className="sponsor-inquiry-heading" id="sponsor-inquiry">Let’s explore what’s possible.</h2>
  </FormPage>;
}
