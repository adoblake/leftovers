import Link from 'next/link';
import { MainNav } from './MainNav';
import { Icon } from './Icon';
import { BrandMark } from './BrandMark';

export function Brand() {
  return <span className="wordmark"><BrandMark /><span>LEFTOVERS<span className="brand-tagline">Finding Value Everywhere.</span></span></span>;
}

export function Header() {
  return <>
    <div className="pilot-bar"><span className="pilot-bar-location"><Icon name="pin" width="12" height="12" /> PHOENIX, ARIZONA</span><span className="pilot-bar-message">A pilot taking root. A community coming together.</span><Link href="/register">Join the interest list <Icon name="arrow" width="13" height="13" /></Link></div>
    <header className="site-header"><Link href="/" aria-label="LEFTOVERS home"><Brand /></Link><MainNav /></header>
  </>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-top"><div className="footer-brand"><Link href="/" aria-label="LEFTOVERS home"><Brand /></Link><p>Good food. Shared possibility.<br />Rooted in Phoenix, Arizona.</p><span className="pilot-label"><span className="status-dot" /> Pilot in development</span></div>
      <div className="footer-column"><h2>Discover</h2><Link href="/mission">Our mission</Link><Link href="/how-it-works">How it works</Link><Link href="/partners">For partners</Link><Link href="/#vision">The bigger picture</Link></div>
      <div className="footer-column"><h2>Get involved</h2><Link href="/register">Food donor registration</Link><Link href="/survey">Food surplus survey</Link><Link href="/pickup">Pickup interest</Link><Link href="/sponsors">Sponsorship opportunities</Link><Link href="/contact">Contact us</Link></div>
      <div className="footer-column"><h2>A thoughtful start</h2><p>Expressions of interest only. Pickups are not currently operational.</p><Link href="/privacy">Privacy & your information</Link><Link href="/dashboard"><Icon name="lock" width="13" height="13" /> Staff workspace</Link></div>
    </div>
    <div className="footer-bottom"><span>LEFTOVERS · Finding Value Everywhere.</span><p>Launch is subject to food safety and regulatory review, partner approval, and operating capacity. No guaranteed pickup availability, free service, or donation tax benefits are promised.</p></div>
  </footer>;
}
