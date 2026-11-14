import Link from 'next/link';
export default function NotFound() {
  return <main id="main" tabIndex={-1} className="page-main editorial"><div className="eyebrow">PAGE NOT FOUND</div><h1>Let’s find your next step.</h1><p>This address does not match a page on LEFTOVERS.</p><Link href="/" className="button">Return to the homepage →</Link></main>;
}
