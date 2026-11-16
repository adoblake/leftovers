import Link from 'next/link';
import { Icon } from './Icon';
import { getPublicSponsors } from '@/lib/sponsors';

export async function SponsorSection({ compact = false }: { compact?: boolean }) {
  const sponsors = await getPublicSponsors();
  return <section className={compact ? 'sponsor-section sponsor-section-compact' : 'band band-cream sponsor-section'} aria-labelledby="sponsor-wall-heading" id="sponsorship">
    <div className="band-inner"><div className="band-head"><p className="kicker">Backers</p><h2 id="sponsor-wall-heading" className="display">{sponsors.length ? 'The people putting in the work behind the work.' : 'Your name could go here.'}</h2><p>We’re looking for backers for the first Phoenix site: funding, vehicles, cold storage, buildings and professional help.</p></div>
    {sponsors.length ? <div className="sponsor-wall">{sponsors.map(sponsor => <article className="sponsor-tile" key={sponsor.id}><span className="eyebrow">{sponsor.support_area}</span><h3>{sponsor.public_name}</h3><p>{sponsor.public_description}</p>{sponsor.website.startsWith('https://') && <a className="text-link" href={sponsor.website} target="_blank" rel="noopener noreferrer">Visit organization <Icon name="arrow" width="16" height="16" /></a>}</article>)}</div> : <div className="sponsor-wall">{['Founding backer', 'Vehicles and storage', 'Professional help'].map(label => <div className="sponsor-tile sponsor-opening" key={label}><Icon name="plus" width="27" height="27" /><h3>{label}</h3><p>Open for a confirmed backer.</p></div>)}</div>}
    <div className="sponsor-wall-note"><p>Only confirmed sponsorships with permission are acknowledged here. An inquiry is not a commitment; personal contact information stays private.</p><Link className="text-link" href={compact ? '#sponsor-inquiry' : '/sponsors'}>Become a backer <Icon name="arrow" width="17" height="17" /></Link></div></div>
  </section>;
}
