import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { CallToAction } from '@/components/CallToAction';

export const metadata: Metadata = { title: 'For partners' };

const partners = [
  { label: 'Food businesses', title: 'Your surplus becomes someone’s shift.', text: 'Restaurants, grocers, bakeries, growers and caterers supply the market. Your food creates paid work instead of landfill.', points: ['Scheduled pickups by a trained crew', 'Every pound tracked', 'Liability protections reviewed by counsel'], href: '/register', action: 'Sign up your business' },
  { label: 'Employers and cities', title: 'A supervised crew, ready to work.', text: 'Event cleanup, catering prep, landscaping, warehouse help. Contracts pay crew wages and give members work history.', points: ['Crew leads on every job', 'Insured and on payroll', 'Fits city cleanup and service contracts'], href: '/contact?topic=employer', action: 'Offer work' },
  { label: 'Clinics and programs', title: 'Care that leads back to work.', text: 'Licensed recovery, health and training providers deliver services at Ambrose Hall, so members can get well and return to the crew.', points: ['You provide and bill for care', 'Health records stay with you', 'Members arrive with a job to return to'], href: '/contact?topic=partner', action: 'Partner with us' },
];

export default function Page() {
  return <main id="main" tabIndex={-1}>
    <section className="page-hero"><div className="band-inner"><p className="kicker">For partners</p><h1 className="display">Every partner <span className="swoosh">makes a paycheck possible.</span></h1><p className="hero-lead">LEFTOVERS runs on three kinds of partners. Each one keeps the loop of work, wages, food and rent turning.</p></div></section>
    <section className="band band-cream"><div className="band-inner partner-grid">{partners.map(partner => <article key={partner.label} className="partner-card"><p className="kicker">{partner.label}</p><h2 className="display">{partner.title}</h2><p>{partner.text}</p><ul className="ticks">{partner.points.map(point => <li key={point}><Icon name="check" /> {point}</li>)}</ul><Link className="pill pill-dark" href={partner.href}>{partner.action} <Icon name="arrow" width="17" height="17" /></Link></article>)}</div>
      <div className="band-inner"><div className="notice"><strong>Interest only, for now.</strong> Nothing is operating yet. Partner terms, pickups and contracts depend on legal and safety review. No tax benefits or guaranteed service are promised.</div></div></section>
    <CallToAction />
  </main>;
}
