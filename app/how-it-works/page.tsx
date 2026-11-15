import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { CallToAction } from '@/components/CallToAction';

export const metadata: Metadata = { title: 'How it works' };

const safeguards = ['Food safety and Maricopa County retail permits', 'Employment law: wages, payroll taxes, workers’ comp', 'Arizona landlord and tenant law for rooms', 'Fair housing and disability accommodations', 'Tax treatment of donated food that is resold', 'Insurance, training and incident procedures'];

export default function Page() {
  return <main id="main" tabIndex={-1}>
    <section className="page-hero"><div className="band-inner"><p className="kicker">How it works</p><h1 className="display">Surplus food in. <span className="swoosh">Paychecks out.</span></h1><p className="hero-lead">LEFTOVERS is three small businesses that feed each other. Food businesses supply the food, the crew does the work, and members spend their wages at the market and on rent.</p></div></section>

    <section className="band band-cream"><div className="band-inner">
      <div className="band-head"><p className="kicker">The flow</p><h2 className="display">From back dock to front door.</h2></div>
      <ol className="flow">
        <li><b>Food businesses</b><span>give surplus food instead of throwing it out</span></li>
        <li><b>The Day Crew</b><span>picks it up, sorts it and stocks the market, paid that day</span></li>
        <li><b>The Leftovers Market</b><span>sells it at cost to anyone, crew included</span></li>
        <li><b>Members</b><span>spend wages on food and rent, and build a record</span></li>
        <li><b>Outside jobs and homes</b><span>members leave with work and a place of their own</span></li>
      </ol>
    </div></section>

    <section className="band band-white"><div className="band-inner detail-grid">
      <article id="crew"><p className="kicker">Business 1</p><h2 className="display">Day Crew</h2><p>Short paid shifts anyone who passes a basic intake can pick up that morning. Work includes driving pickups, sorting, cleaning and running the market, plus contracts like event cleanup, catering prep and landscaping.</p><ul className="ticks"><li><Icon name="check" /> At least Arizona minimum wage</li><li><Icon name="check" /> Paid in money, the same day</li><li><Icon name="check" /> Steady members become crew leads</li></ul></article>
      <article id="market"><p className="kicker">Business 2</p><h2 className="display">Leftovers Market</h2><p>A small grocery selling recovered food at prices that only cover handling, cold storage and transport. Anyone can shop there. Members pay like any other customer.</p><ul className="ticks"><li><Icon name="check" /> Prices tied to real costs</li><li><Icon name="check" /> Open to the whole neighborhood</li><li><Icon name="check" /> Every pound tracked from pickup to sale</li></ul></article>
      <article id="housing"><p className="kicker">Business 3</p><h2 className="display">Leftovers Housing</h2><p>Private or shared rooms. Rent is a share of what a member earns, so it rises as they work more and never takes the whole paycheck. Missed rent starts with a plan and a conversation, then the consequences written into the agreement.</p><ul className="ticks"><li><Icon name="check" /> Rent as a share of income</li><li><Icon name="check" /> Written agreements, reviewed by a housing lawyer</li><li><Icon name="check" /> On-time rent builds a rental history</li></ul></article>
      <article id="ambrose"><p className="kicker">Phase 2</p><h2 className="display">Ambrose Hall</h2><p>A facility for addiction recovery, basic health care and job training, run with licensed partners. Members step in when they need it and return to the crew when they’re ready. Alumni with steady jobs can live on site, pay rent and mentor newer members.</p><ul className="ticks"><li><Icon name="check" /> Care from licensed partners</li><li><Icon name="check" /> Health records stay with the provider</li><li><Icon name="check" /> Alumni as paying tenants and mentors</li></ul></article>
    </div></section>

    <section className="band band-green"><div className="band-inner prose-grid">
      <div><h2 className="display">Done right before it’s done fast.</h2></div>
      <div className="prose"><p>Nothing opens until these are reviewed by the right lawyers, advisors and agencies:</p><ul className="ticks ticks-light">{safeguards.map(item => <li key={item}><Icon name="shield" /> {item}</li>)}</ul></div>
    </div></section>

    <section className="band band-cream"><div className="band-inner"><div className="band-head"><h2 className="display">Want in?</h2><p>Sign-ups are interest only. No shifts, pickups, market or housing are running yet.</p></div><div className="actions"><Link className="pill pill-dark" href="/crew">Join the Day Crew list <Icon name="arrow" width="18" height="18" /></Link><Link className="pill pill-outline" href="/register">I have surplus food <Icon name="arrow" width="18" height="18" /></Link></div></div></section>
    <CallToAction />
  </main>;
}
