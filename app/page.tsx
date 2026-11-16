import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { BrandMark } from '@/components/BrandMark';
import { Faq } from '@/components/Faq';
import { SponsorSection } from '@/components/SponsorSection';
import { CallToAction } from '@/components/CallToAction';

export const revalidate = 300;

const loop = ['Work', 'Get paid', 'Eat', 'Pay rent', 'Move up'];

const steps = [
  { title: 'Day One is on us.', text: 'One meal and one night, so nobody starts hungry. After that, everything is earned.' },
  { title: 'Pick up a shift.', text: 'Show up in the morning and join the Day Crew: pickups, sorting, cleaning, running the market.' },
  { title: 'Get paid that day.', text: 'Real wages, at least Arizona minimum wage, paid in money at the end of the shift.' },
  { title: 'Spend it like anyone.', text: 'Buy groceries at the Leftovers Market and pay rent on your room. Then do it again.' },
];

const phases = [
  { label: 'NOW', name: 'Set up', text: 'Legal review, permits, food businesses and employers signed up.', gate: 'Legal sign-off', current: true },
  { label: 'PHASE 1', name: 'Crew and Market', text: 'Paid Day Crew shifts, the Leftovers Market and first rented rooms in Phoenix.', gate: 'First graduates' },
  { label: 'PHASE 2', name: 'Ambrose Hall', text: 'Recovery, basic health care and job training with licensed partners. Alumni live on site.', gate: 'Results hold for a year' },
  { label: 'PHASE 3', name: 'Other cities', text: 'A playbook, shared software and local operators bring the model across the country.' },
];

export default function Home() {
  return <main id="main" tabIndex={-1}>
    <section className="hero-band" aria-labelledby="hero-heading">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="kicker"><Icon name="pin" width="16" height="16" /> Phoenix first. Then the country.</p>
          <h1 id="hero-heading" className="display">Nothing handed out. <span className="swoosh">Everything earned.</span></h1>
          <p className="hero-lead">LEFTOVERS turns food that would be thrown away into paid same-day work, fair-price groceries and rooms people pay for themselves. It’s a business built to end homelessness, not a handout.</p>
          <div className="actions"><Link className="pill pill-dark" href="/crew">Join the Day Crew list <Icon name="arrow" width="18" height="18" /></Link><Link className="pill pill-outline" href="/register">I have surplus food <Icon name="arrow" width="18" height="18" /></Link></div>
          <p className="hero-status"><span className="status-dot" /> In planning. No shifts, pickups, market or housing are running yet.</p>
        </div>
        <div className="hero-stickers" aria-hidden="true">
          <BrandMark />
          <span className="sticker s1">Work</span><span className="sticker s2">Get paid</span><span className="sticker s3">Eat</span><span className="sticker s4">Pay rent</span><span className="sticker s5">Move up</span>
        </div>
      </div>
    </section>

    <div className="loop-strip">
      <p className="sr-only">The daily loop: work, get paid, eat, pay rent, move up.</p>
      <div className="loop-track" aria-hidden="true">{[0, 1].map(copy => <span key={copy}>{loop.map(word => <span key={word}>{word}<Icon name="sun" width="18" height="18" /></span>)}</span>)}</div>
    </div>

    <section className="band band-cream" aria-labelledby="deal-heading">
      <div className="band-inner">
        <div className="band-head"><p className="kicker">The deal</p><h2 id="deal-heading" className="display">How a day works.</h2><p>Four steps, every day, until a member walks out with a job and a home of their own.</p></div>
        <ol className="deal-steps">{steps.map((step, index) => <li key={step.title}><span className="deal-num">{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        <Link className="text-link" href="/how-it-works">See the full model <Icon name="arrow" width="17" height="17" /></Link>
      </div>
    </section>

    <section className="band band-white" aria-labelledby="business-heading">
      <div className="band-inner">
        <div className="band-head"><p className="kicker">Three businesses, one goal</p><h2 id="business-heading" className="display">Every part pays its way.</h2></div>
        <div className="biz-grid">
          <article className="biz biz-green"><Icon name="people" width="34" height="34" /><h3>Day Crew</h3><p>Paid shifts you can pick up that morning. Work comes from our own operations and from outside contracts like event cleanup and catering prep.</p><p className="biz-earns"><b>Earns from</b> work contracts with businesses and cities</p><Link className="text-link" href="/crew">Join the list <Icon name="arrow" width="16" height="16" /></Link></article>
          <article className="biz biz-gold"><Icon name="box" width="34" height="34" /><h3>Leftovers Market</h3><p>A store selling recovered food at prices that only cover handling, storage and transport. Anyone can shop. Crew members pay with their wages like any customer.</p><p className="biz-earns"><b>Earns from</b> grocery sales at cost</p><Link className="text-link" href="/register">Supply the market <Icon name="arrow" width="16" height="16" /></Link></article>
          <article className="biz biz-line"><Icon name="shield" width="34" height="34" /><h3>Leftovers Housing</h3><p>Private or shared rooms. Rent is a share of what you earn, so it grows as you work more and never takes everything.</p><p className="biz-earns"><b>Earns from</b> member rent</p><Link className="text-link" href="/how-it-works#housing">How rent works <Icon name="arrow" width="16" height="16" /></Link></article>
        </div>
      </div>
    </section>

    <section className="band band-green manifesto" aria-labelledby="manifesto-heading">
      <div className="band-inner manifesto-inner">
        <h2 id="manifesto-heading" className="display">Not a charity. <span className="gold-text">A business that bets on you.</span></h2>
        <div className="manifesto-copy">
          <p>Handouts keep people where they are. A paycheck, a bill paid on time and a key you paid for build something nobody can give you: proof that you can stand on your own.</p>
          <p>So LEFTOVERS runs like a business. Members are crew, customers and tenants, with the same deal as anyone else. We hold up our end with fair pay, fair prices and fair rent.</p>
          <p className="manifesto-note"><b>Who it’s for:</b> adults who are able and ready to work. Children, elderly people and anyone in a medical crisis are referred to partners on Day One.</p>
        </div>
      </div>
    </section>

    <section className="band band-cream" aria-labelledby="join-heading">
      <div className="band-inner">
        <div className="band-head"><p className="kicker">Get involved</p><h2 id="join-heading" className="display">Pick your role.</h2></div>
        <div className="join-grid">
          <Link className="join-tile" href="/register"><span className="join-label">Food businesses</span><b>Turn surplus into someone’s paycheck.</b><span className="join-go">Sign up <Icon name="arrow" width="18" height="18" /></span></Link>
          <Link className="join-tile" href="/contact?topic=employer"><span className="join-label">Employers and cities</span><b>Hire a supervised crew for real work.</b><span className="join-go">Offer work <Icon name="arrow" width="18" height="18" /></span></Link>
          <Link className="join-tile" href="/contact?topic=partner"><span className="join-label">Clinics and programs</span><b>Bring recovery and health care to Ambrose Hall.</b><span className="join-go">Partner with us <Icon name="arrow" width="18" height="18" /></span></Link>
          <Link className="join-tile join-tile-gold" href="/sponsors"><span className="join-label">Sponsors and investors</span><b>Fund the first site in Phoenix.</b><span className="join-go">Start a conversation <Icon name="arrow" width="18" height="18" /></span></Link>
        </div>
      </div>
    </section>

    <section className="band band-white" id="roadmap" aria-labelledby="roadmap-heading">
      <div className="band-inner">
        <div className="band-head"><p className="kicker">Roadmap</p><h2 id="roadmap-heading" className="display">Prove it in Phoenix. Then go national.</h2><p>Each phase opens only when the one before it shows results.</p></div>
        <ol className="roadmap">{phases.map(phase => <li key={phase.name} className={phase.current ? 'current' : undefined}><span className="phase-tag">{phase.label}</span><h3>{phase.name}</h3><p>{phase.text}</p>{phase.gate && <span className="gate"><span className="gate-mark" aria-hidden="true" />Next gate: {phase.gate}</span>}</li>)}</ol>
      </div>
    </section>

    <SponsorSection /><Faq /><CallToAction />
  </main>;
}
