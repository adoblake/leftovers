import Link from 'next/link';
import { getDataMode } from '@/lib/runtime-config';
export const metadata = { title: 'Accessibility' };

export default function Accessibility() {
  return <main id="main" tabIndex={-1} className="page-main editorial">
    <div className="eyebrow">ACCESSIBILITY</div><h1>A place for everyone.</h1>
    <p className="lead">We aim to make LEFTOVERS usable by people with different abilities, devices, and ways of navigating. Our accessibility target is the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA.</p>
    <h2>Using the site</h2><p>You can use a keyboard to reach links, forms, and FAQ controls. The first link skips navigation and moves to the main content. The mobile menu closes with Escape or when focus leaves it.</p>
    <p>Forms include labels, instructions, and linked error messages. You can zoom and resize text. Dashboard tables have named scroll regions that support keyboard navigation. Password managers and pasting passwords are supported.</p>
    <h2>Ongoing review</h2><p>We use automated accessibility checks and manual keyboard and layout checks while developing the site. These checks do not establish complete WCAG conformance. Further screen-reader and real-device review, including the deployed spam-check widget and configured staff accounts, remains part of our launch work.</p>
    <h2>Tell us about a barrier</h2><p>Please use our <Link href="/contact">contact form</Link> to describe the page, the problem, and your browser or assistive technology if you wish. Please do not include passwords or other sensitive information.</p>
    {getDataMode() !== 'supabase' && <p>This demo does not save or send contact messages. Until contact collection opens, please report a barrier through the project contact who shared this site with you.</p>}
  </main>;
}
