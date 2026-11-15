import Link from 'next/link';
import { MainNav } from './MainNav';
import { Icon } from './Icon';
import { BrandMark } from './BrandMark';

export function Brand() {
  return <span className="wordmark"><BrandMark /><span>LEFTOVERS{' '}<span className="brand-tagline">Earn it. Own it.</span></span></span>;
}

export function Header({ preview = false }: { preview?: boolean }) {
  return <header className="masthead">
    <div className="pilot-bar"><span className="pilot-bar-location"><Icon name="pin" width="12" height="12" /> PHOENIX FIRST. THEN THE COUNTRY.</span><span className="pilot-bar-message">In planning: nothing is operating yet.</span><Link href="/crew">Join the Day Crew list <Icon name="arrow" width="13" height="13" /></Link></div>
    <div className="site-header"><Link href="/" className="brand-link"><Brand /><span className="sr-only"> Home</span></Link><MainNav /></div>
    {preview && <div className="public-demo-banner"><strong>PUBLIC DEMO</strong> Explore with fictional details. Form responses are not saved or sent.</div>}
  </header>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-shout" aria-hidden="true">Work. Earn. Eat. Rent. Rise.</div>
      <div className="footer-top">
        <div className="footer-brand"><Link href="/" className="brand-link"><Brand /><span className="sr-only"> Home</span></Link><p>Surplus food, paid work and a place of your own, earned the honest way. Starting in Phoenix, Arizona.</p><span className="pilot-label"><span className="status-dot" /> In planning, not operating yet</span></div>
        <div className="footer-column"><h2>The model</h2><Link href="/mission">Our mission</Link><Link href="/how-it-works">How it works</Link><Link href="/#roadmap">Roadmap</Link><Link href="/partners">For partners</Link></div>
        <div className="footer-column"><h2>Get involved</h2><Link href="/crew">Join the Day Crew list</Link><Link href="/register">Food business sign-up</Link><Link href="/survey">Food surplus survey</Link><Link href="/contact?topic=employer">Offer crew work</Link><Link href="/sponsors">Sponsor or invest</Link><Link href="/contact">Contact us</Link></div>
        <div className="footer-column"><h2>Straight talk</h2><p>Sign-ups are interest only. No shifts, pickups, market or housing are running yet.</p><Link href="/privacy">Privacy & your information</Link><Link href="/accessibility">Accessibility</Link><Link href="/dashboard"><Icon name="lock" width="13" height="13" /> Staff workspace</Link></div>
      </div>
      <div className="footer-bottom"><span>LEFTOVERS · Earn it. Own it.</span><p>Launch depends on food safety, employment and housing law review, partner agreements and funding. No jobs, wages, housing, pickups or donation tax benefits are promised by this website.</p></div>
    </div>
  </footer>;
}
