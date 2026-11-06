import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/Icon';
import { ProduceArt } from '@/components/ProduceArt';
import { Faq } from '@/components/Faq';
import { SponsorSection } from '@/components/SponsorSection';
import { CallToAction } from '@/components/CallToAction';

export const revalidate = 300;

export default function Home() {
  return <main id="main">
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><Icon name="sun" width="18" height="18" /> GOOD FOOD. GREATER POSSIBILITY.</div>
        <h1>Good food.<br />New purpose.<br /><em>Stronger community.</em></h1>
        <p>There’s more to what’s left over. We’re bringing Phoenix together to help good food find its next chapter.</p>
        <div className="actions"><Link className="button" href="/register">Become a food donor <Icon name="arrow" width="18" height="18" /></Link><Link className="text-link" href="/how-it-works">See how it works <Icon name="arrow" width="16" height="16" /></Link></div>
        <div className="hero-note"><span className="status-dot" /> Phoenix pilot in development<span className="divider">/</span>Interest, not a pickup booking</div>
      </div><ProduceArt />
    </section>
    <div className="values-strip"><span>Food is a resource. <b>Let’s treat it like one.</b></span><Icon name="sun" width="16" height="16" /><span>Rooted in Phoenix</span><Icon name="sun" width="16" height="16" /><span>Built around community</span><Icon name="sun" width="16" height="16" /><span>Possibility over waste</span></div>
    <section className="intro section" aria-labelledby="intro-heading"><div className="intro-brand"><Image src="/branding/leftovers-green-gold.png" width={2284} height={2284} unoptimized alt="LEFTOVERS leaf L and wordmark in gold on forest green. Never ending value." /></div><div><div className="eyebrow">THE IDEA IS SIMPLE</div><h2 id="intro-heading">Surplus isn’t the end.<br />It’s a <em>starting point.</em></h2><p>Good food can be left behind for all kinds of reasons. We’re exploring a better path: connecting businesses with surplus food to community partners who can put it to use.</p><p>First, we listen. Then, we build a responsible local pilot around what Phoenix actually needs.</p><Link className="text-link" href="/mission">Get to know our mission <Icon name="arrow" width="17" height="17" /></Link></div></section>
    <section className="section steps-section" aria-labelledby="steps-heading"><div className="section-heading"><div><div className="eyebrow">SMALL STEPS. SHARED POSSIBILITY.</div><h2 id="steps-heading">A better next chapter.</h2></div><Link className="text-link" href="/how-it-works">Explore the process <Icon name="arrow" width="17" height="17" /></Link></div>
      <div className="cards process-cards">
        <article><div className="step-top"><span className="step-number">01 / SHARE</span><Icon name="box" width="29" height="29" /></div><h3>Tell us what’s possible.</h3><p>Have surplus food? Share a little about your business, food types, and timing. Your input helps shape a practical pilot.</p><Link href="/survey">Take the surplus survey <Icon name="arrow" width="16" height="16" /></Link></article>
        <article><div className="step-top"><span className="step-number">02 / CONNECT</span><Icon name="people" width="29" height="29" /></div><h3>Find common ground.</h3><p>We’ll review interest and explore suitable recipient partners, safe handling requirements, and realistic logistics.</p><Link href="/partners">Explore a partnership <Icon name="arrow" width="16" height="16" /></Link></article>
        <article><div className="step-top"><span className="step-number">03 / GROW</span><Icon name="leaf" width="29" height="29" /></div><h3>Make room for more.</h3><p>An approved pilot would help us learn, measure actual recovery, and grow a stronger local network, together.</p><Link href="/pickup">Express pickup interest <Icon name="arrow" width="16" height="16" /></Link></article>
      </div>
      <p className="section-footnote"><Icon name="shield" width="16" height="16" /> Food safety and regulatory review come before operational launch. No pickups are currently operational.</p>
    </section>
    <section className="partner-section section" aria-labelledby="partner-heading"><div className="section-heading"><div><div className="eyebrow">LOCAL CONNECTIONS. SHARED PURPOSE.</div><h2 id="partner-heading">Good things happen<br />when we <em>come together.</em></h2></div><p>Every organization brings something different to the table. There’s more than one way to help.</p></div>
      <div className="partner-panels"><article><div className="partner-icon"><Icon name="box" width="30" height="30" /></div><div className="eyebrow">FOR FOOD BUSINESSES</div><h3>A new path for your surplus.</h3><p>Restaurants, grocers, bakeries, growers, and food businesses can help us understand where good food is left over.</p><ul><li><Icon name="check" /> Share your surplus patterns</li><li><Icon name="check" /> Explore a potential recovery partnership</li><li><Icon name="check" /> Help shape practical local logistics</li></ul><Link className="text-link" href="/register">Register donor interest <Icon name="arrow" width="17" height="17" /></Link></article>
      <article><div className="partner-icon"><Icon name="people" width="30" height="30" /></div><div className="eyebrow">FOR COMMUNITY ORGANIZATIONS</div><h3>Bring your local knowledge.</h3><p>Pantries, nonprofits, and community groups can help shape a pilot around real needs and available capacity.</p><ul><li><Icon name="check" /> Share food and storage needs</li><li><Icon name="check" /> Explore recipient partnership</li><li><Icon name="check" /> Build relationships across Phoenix</li></ul><Link className="text-link" href="/contact?topic=partner">Introduce your organization <Icon name="arrow" width="17" height="17" /></Link></article></div>
    </section>
    <section className="vision section" id="vision" aria-labelledby="vision-heading"><div className="vision-intro"><div><div className="eyebrow">ONE VISION. ROOM TO GROW.</div><h2 id="vision-heading">Starting with food.<br /><em>Thinking beyond it.</em></h2></div><p>A Phoenix food recovery pilot is the first proposed step. The bigger picture is a community that finds more value in its food, resources, and people.</p></div>
      <div className="phases"><div className="phase-current"><span className="phase-label">IN DEVELOPMENT</span><b>01</b><h3>Phoenix food recovery</h3><p>Listening, connecting, and planning a responsible local pilot.</p></div><div><span className="phase-label">PROPOSED</span><b>02</b><h3>Community market</h3><p>A future place to connect food, people, and opportunity.</p></div><div><span className="phase-label">PROPOSED</span><b>03</b><h3>Ambrose Hall</h3><p>A vision for workforce development and community services.</p></div><div><span className="phase-label">LONG-TERM VISION</span><Icon name="arrow" width="22" height="22" /><h3>Resource recovery</h3><p>Exploring value beyond food, one thoughtful step at a time.</p></div></div>
      <p className="vision-footnote">Later phases are proposed and have not launched. <Link href="/mission">Read the full vision <Icon name="arrow" width="15" height="15" /></Link></p>
    </section>
    <SponsorSection /><Faq /><CallToAction />
  </main>;
}
