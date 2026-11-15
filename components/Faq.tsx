import Link from 'next/link';
import { Icon } from './Icon';

const questions = [
  { question: 'Is anything running right now?', answer: 'No. LEFTOVERS is in planning. Shifts, pickups, the market and housing open only after food safety, employment and housing law review. Signing up puts you on a list; it does not book anything.' },
  { question: 'Why not just give food and shelter away?', answer: 'Free help keeps people alive, and other organizations do that well. LEFTOVERS is built for the next step: steady work, paying your own way and leaving with a job and a home. Day One is covered so nobody starts hungry. After that, it’s earned.' },
  { question: 'How does the Day Crew get paid?', answer: 'With real wages in money, at least Arizona minimum wage, paid the same day. Members are never paid in food, beds or credits. They spend their wages at the market and on rent like any customer or tenant.' },
  { question: 'How much is rent?', answer: 'Rent will be a share of what a member earns, so it grows as they work more and never takes their whole paycheck. Exact terms will be set with a housing lawyer before any rooms open.' },
  { question: 'What if someone can’t work?', answer: 'LEFTOVERS is for adults who are able and ready to work. Anyone who can’t, such as children, elderly people or someone in a medical crisis, is referred to partner organizations on Day One. Reasonable accommodations will be part of every work and housing policy.' },
  { question: 'Do food businesses get a tax deduction?', answer: 'Not promised. Because food is sold at cost in the market, the usual donation deduction may not apply. We are confirming this with a tax advisor. Ask your own advisor about your situation.' },
];

export function Faq() {
  return <section className="band band-white faq-band" aria-labelledby="faq-heading"><div className="band-inner faq-section"><div className="faq-intro"><p className="kicker">Straight answers</p><h2 id="faq-heading" className="display">Fair questions.</h2><p>We’d rather be clear than sound good.</p><Link className="text-link" href="/contact">Ask us something else <Icon name="arrow" width="17" height="17" /></Link></div><div className="faq-list">{questions.map(({ question, answer }, index) => <details key={question} name="pilot-faq"><summary><span className="faq-number">{String(index + 1).padStart(2, '0')}</span><span>{question}</span><Icon name="plus" width="20" height="20" /></summary><p>{answer}</p></details>)}</div></div></section>;
}
