'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { Icon } from './Icon';

const links = [
  { href: '/mission', label: 'Our mission' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/partners', label: 'For partners' },
  { href: '/sponsors', label: 'Sponsorship' },
  { href: '/contact', label: 'Contact' },
];

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return <div className="navigation" onKeyDown={event => {
    if (event.key === 'Escape' && open) { setOpen(false); button.current?.focus(); }
  }}>
    <button ref={button} className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
      <span>{open ? 'Close' : 'Menu'}</span><Icon name={open ? 'close' : 'menu'} />
    </button>
    <nav id="main-navigation" aria-label="Main navigation" data-open={open}>
      {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
      <Link className="button small" href="/get-involved" onClick={() => setOpen(false)}>Get involved <Icon name="arrow" width="17" height="17" /></Link>
    </nav>
  </div>;
}
