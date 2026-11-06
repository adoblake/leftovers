import Link from 'next/link';
import { Icon } from './Icon';

export function CallToAction() {
  return <section className="contact section" id="contact"><div><div className="eyebrow">LET’S BUILD SOMETHING GOOD</div><h2>There’s a place for you<br /><em>at this table.</em></h2><p>Food businesses, community organizations, and curious neighbors: help shape what comes next.</p></div><div className="contact-actions"><Link className="button gold" href="/get-involved">Find your way to get involved <Icon name="arrow" width="18" height="18" /></Link><Link className="text-link" href="/contact">Start a conversation <Icon name="arrow" width="17" height="17" /></Link><span className="contact-note"><Icon name="pin" width="14" height="14" /> Phoenix, Arizona · Pilot in development</span></div></section>;
}
