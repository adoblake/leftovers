import Link from 'next/link';
import { Icon } from './Icon';

export function CallToAction() {
  return <section className="band band-gold cta-band" id="contact" aria-labelledby="cta-heading"><div className="band-inner cta-inner"><div><p className="kicker">Let’s get to work</p><h2 id="cta-heading" className="display">Ending homelessness is a job. Help us do it.</h2></div><div className="contact-actions"><Link className="pill pill-dark" href="/get-involved">Find your role <Icon name="arrow" width="18" height="18" /></Link><Link className="text-link" href="/contact">Talk to us <Icon name="arrow" width="17" height="17" /></Link><span className="contact-note"><Icon name="pin" width="14" height="14" /> Phoenix, Arizona · In planning</span></div></div></section>;
}
