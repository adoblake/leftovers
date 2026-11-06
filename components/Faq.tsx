import Link from 'next/link';
import { Icon } from './Icon';

const questions = [
  { question: 'Are food pickups available right now?', answer: 'Not yet. LEFTOVERS is developing a Phoenix pilot. Every registration or pickup request is an expression of interest pending review and approval. Submitting a form does not schedule a pickup.' },
  { question: 'What kinds of food are you exploring?', answer: 'We’re gathering information about produce, bakery items, prepared meals, and packaged goods. Food eligibility, storage, labeling, and safe transportation must be reviewed before any recovery activity is approved.' },
  { question: 'Can a community organization get involved?', answer: 'Yes. Prospective recipient partners can share their food needs, storage capacity, and distribution experience through our contact form. A conversation is a starting point, not a confirmed partnership.' },
  { question: 'Is pickup free, or does donating provide a tax benefit?', answer: 'No service price or donation tax benefit is promised. Operating costs and any future service terms are still being evaluated. Ask a qualified advisor about your own tax circumstances.' },
  { question: 'What happens after I express interest?', answer: 'In the public demo, forms validate fictional responses without saving them or notifying anyone. Local development mode saves responses on that machine. In a configured pilot environment, authorized staff can review interest and may follow up; no response or pickup timeframe is guaranteed.' },
];

export function Faq() {
  return <section className="faq-section section" aria-labelledby="faq-heading"><div className="faq-intro"><div className="eyebrow">A FEW GOOD QUESTIONS</div><h2 id="faq-heading">Let’s clear<br />things up.</h2><p>Building trust starts with being clear about where we are.</p><Link className="text-link" href="/contact">Have another question? <Icon name="arrow" width="17" height="17" /></Link></div><div className="faq-list">{questions.map(({ question, answer }, index) => <details key={question} name="pilot-faq"><summary><span className="faq-number">0{index + 1}</span><span>{question}</span><Icon name="plus" width="18" height="18" /></summary><p>{answer}</p></details>)}</div></section>;
}
