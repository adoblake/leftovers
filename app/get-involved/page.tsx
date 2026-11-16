import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Get involved' };
const ways = [
  { icon: 'people', label: 'I’M READY TO WORK', title: 'Join the Day Crew list.', description: 'Get notified when paid same-day shifts open in Phoenix. Not an application or job offer yet.', href: '/crew', action: 'Join the list' },
  { icon: 'box', label: 'I HAVE SURPLUS FOOD', title: 'Supply the market.', description: 'Restaurants, grocers, bakeries, farms and caterers: sign up to turn surplus into paid work.', href: '/register', action: 'Sign up your business' },
  { icon: 'chart', label: 'I HAVE WORK THAT NEEDS DOING', title: 'Hire the crew.', description: 'Cleanup, catering prep, landscaping or warehouse help. Tell us what a supervised crew could take on.', href: '/contact?topic=employer', action: 'Offer work' },
  { icon: 'shield', label: 'I RUN A CLINIC OR PROGRAM', title: 'Partner on Ambrose Hall.', description: 'Recovery, health and training providers: bring your services to members who have a job to return to.', href: '/contact?topic=partner', action: 'Partner with us' },
  { icon: 'heart', label: 'I WANT TO BACK THIS', title: 'Sponsor or invest.', description: 'Help fund the first Phoenix site: vehicles, cold storage, a building or professional help.', href: '/sponsors', action: 'Become a backer' },
  { icon: 'leaf', label: 'I KNOW MY FOOD NUMBERS', title: 'Take the surplus survey.', description: 'A few estimates about food types, amounts and timing help us size the market.', href: '/survey', action: 'Take the survey' },
] as const;

export default function Page() {
  return <main id="main" tabIndex={-1}>
    <section className="page-hero"><div className="band-inner"><p className="kicker">Get involved</p><h1 className="display">Pick your role. <span className="swoosh">Get to work.</span></h1><p className="hero-lead">Ending homelessness takes food, work, care and money. Choose the part you can bring.</p></div></section>
    <section className="band band-cream"><div className="band-inner"><div className="involvement-grid">{ways.map(way => <article className="involvement-card" key={way.href}><Icon name={way.icon} width="32" height="32" /><p className="kicker">{way.label}</p><h2>{way.title}</h2><p>{way.description}</p><Link className="text-link" href={way.href}>{way.action}<Icon name="arrow" width="17" height="17" /></Link></article>)}</div>
      <div className="notice"><strong>Planning stage.</strong> Nothing is operating yet. Every sign-up is interest only, pending legal and safety review. No jobs, housing, pickups or tax benefits are promised.</div><p>Have a question first? <Link className="text-link" href="/contact">Talk to us <Icon name="arrow" width="16" height="16" /></Link></p></div></section>
  </main>;
}
