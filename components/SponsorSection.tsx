import Link from 'next/link';
import { Icon } from './Icon';
import { getPublicSponsors } from '@/lib/sponsors';

export async function SponsorSection({ compact = false }: { compact?: boolean }) {
  const sponsors = await getPublicSponsors();
  return <section className={compact ? 'sponsor-section sponsor-section-compact' : 'sponsor-section section'} aria-labelledby="sponsor-wall-heading" id="sponsorship">
    <div className="section-heading"><div><div className="eyebrow">ROOM FOR THE PEOPLE WHO MAKE IT POSSIBLE</div><h2 id="sponsor-wall-heading">{sponsors.length ? <>People helping<br /><em>possibility take root.</em></> : <>A place for our<br /><em>future supporters.</em></>}</h2></div><p>Help shape a responsible Phoenix pilot. We’re opening conversations about funding, practical resources, and local expertise.</p></div>
    {sponsors.length ? <div className="sponsor-wall">{sponsors.map(sponsor => <article className="sponsor-tile" key={sponsor.id}><span className="eyebrow">{sponsor.support_area}</span><h3>{sponsor.public_name}</h3><p>{sponsor.public_description}</p>{sponsor.website.startsWith('https://') && <a className="text-link" href={sponsor.website} target="_blank" rel="noopener noreferrer">Visit organization <Icon name="arrow" width="16" height="16" /></a>}</article>)}</div> : <div className="sponsor-wall">{['Founding support', 'In-kind resources', 'Community expertise'].map(label => <div className="sponsor-tile sponsor-opening" key={label}><Icon name="plus" width="27" height="27" /><h3>{label}</h3><p>Space reserved for a future approved sponsor.</p></div>)}</div>}
    <div className="sponsor-wall-note"><p>Only confirmed sponsorships with permission are acknowledged here. An inquiry is not a commitment; personal contact information stays private.</p><Link className="text-link" href={compact ? '#sponsor-inquiry' : '/sponsors'}>Explore sponsorship <Icon name="arrow" width="17" height="17" /></Link></div>
  </section>;
}
