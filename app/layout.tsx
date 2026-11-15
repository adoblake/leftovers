import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import './brand.css';
import { getDataMode } from '@/lib/runtime-config';
import { Header, Footer } from '@/components/Header';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'LEFTOVERS — Earn it. Own it.', template: '%s | LEFTOVERS' },
  description: 'LEFTOVERS turns surplus food into paid same-day work, fair-price groceries and rooms people pay for themselves. Starting in Phoenix. In planning, not yet operating.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={archivo.variable}><body><a className="skip" href="#main">Skip to content</a><Header preview={getDataMode() === 'preview'} />{children}<Footer /></body></html>;
}
