import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Get involved' };
const ways = [
  { icon: 'heart', label: 'I’D LIKE TO SUPPORT THE PILOT', title: 'Explore sponsorship.', description: 'Start a conversation about funding, equipment, transport, or professional support. No payment or commitment is required to inquire.', href: '/sponsors', action: 'Explore sponsorship opportunities' },
  { icon: 'box', label: 'I HAVE SURPLUS FOOD', title: 'Become a potential donor.', description: 'Introduce your restaurant, grocery, bakery, farm, or other food business. Help us explore a path for your surplus.', href: '/register', action: 'Register donor interest' },
  { icon: 'people', label: 'I REPRESENT A COMMUNITY ORGANIZATION', title: 'Explore recipient partnership.', description: 'Share your organization’s food needs, storage capacity, and local knowledge. Let’s explore what a partnership could look like.', href: '/contact?topic=partner', action: 'Introduce your organization' },
  { icon: 'chart', label: 'I CAN HELP WITH PILOT PLANNING', title: 'Tell us about your surplus.', description: 'A few estimates about food types, quantities, and frequency can help us build a pilot around real needs.', href: '/survey', action: 'Take the food surplus survey' },
  { icon: 'pin', label: 'I’M INTERESTED IN A FUTURE PICKUP', title: 'Start with an expression of interest.', description: 'Help us understand potential pickup needs. This is a planning conversation, not a reservation or a confirmed service.', href: '/pickup', action: 'Express pickup interest' },
] as const;

export default function Page() {
  return <main id="main" className="page-main"><div className="eyebrow">GOOD FOOD. MORE CONNECTIONS.</div><h1>Find your place<br /><em>at the table.</em></h1><p className="lead">A better next chapter starts with people like you. Choose the path that fits, and help shape the Phoenix pilot.</p>
    <div className="involvement-grid">{ways.map(way => <article className="involvement-card" key={way.href}><Icon name={way.icon} width="32" height="32" /><div className="eyebrow">{way.label}</div><h2>{way.title}</h2><p>{way.description}</p><Link className="text-link" href={way.href}>{way.action}<Icon name="arrow" width="17" height="17" /></Link></article>)}</div>
    <div className="notice"><strong>A pilot in the making.</strong> Pickups are not operational. All interest is pending review and approval. Food safety and regulatory review come before launch; availability, pricing, and tax benefits are not promised.</div><p>Have an idea or a question? <Link className="text-link" href="/contact">Let’s talk <Icon name="arrow" width="16" height="16" /></Link></p>
  </main>;
}
