import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { CallToAction } from '@/components/CallToAction';

export const metadata: Metadata = { title: 'Our mission' };

export default function Page() {
  return <main id="main" tabIndex={-1}>
    <section className="page-hero"><div className="band-inner"><p className="kicker">Our mission</p><h1 className="display">End homelessness. <span className="swoosh">One paycheck at a time.</span></h1><p className="hero-lead">Every day, good food gets thrown out while people go without. LEFTOVERS puts both to work: surplus food becomes paid jobs, fair-price groceries and rooms people pay for themselves.</p></div></section>
    <section className="band band-cream"><div className="band-inner prose-grid">
      <div><h2 className="display">What we believe</h2></div>
      <div className="prose">
        <p><b>Nothing is free, and that’s the point.</b> Earning your food and paying your rent builds the habits and confidence a handout can’t. We treat members as crew, customers and tenants, not cases.</p>
        <p><b>Fair deals both ways.</b> Members put in honest work. We pay honest wages the same day, charge prices that only cover our costs and set rent as a share of income.</p>
        <p><b>Day One is covered.</b> Nobody should have to work hungry for their first shift. One meal and one night are on us. After that, it’s earned.</p>
        <p><b>Clear about who we serve.</b> LEFTOVERS is for adults who are able and ready to work. People who can’t are referred to partners on Day One.</p>
        <p><b>Proof before growth.</b> We measure people moving into outside jobs and their own homes. Only when Phoenix shows results do we take the model to other cities.</p>
      </div>
    </div></section>
    <section className="band band-white"><div className="band-inner"><div className="band-head"><p className="kicker">Where we are</p><h2 className="display">Planning, honestly.</h2><p>Right now we’re signing up food businesses, employers and partners, and getting legal review on wages, food sales and housing. Nothing is operating yet.</p></div><Link className="pill pill-dark" href="/how-it-works">See how it will work <Icon name="arrow" width="18" height="18" /></Link></div></section>
    <CallToAction />
  </main>;
}
