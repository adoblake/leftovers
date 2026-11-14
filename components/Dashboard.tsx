import Link from 'next/link';
import type { ReactNode } from 'react';

type Row = Record<string, unknown>;
type Props = { demo?: boolean; interests?: Row[]; partners?: Row[]; pickups?: Row[]; costs?: Row[]; children?: ReactNode };

export function Dashboard({ demo = false, interests = [], partners = [], pickups = [], costs = [], children }: Props) {
  const recovered = pickups.filter(p => p.status === 'Completed').reduce((n, p) => n + Number(p.actual_pounds || 0), 0);
  const total = costs.reduce((n, c) => n + Number(c.amount || 0), 0);
  return <main id="main" tabIndex={-1} className="dashboard">
    <div className="dashboard-top"><div><div className="eyebrow">PHOENIX PILOT / {demo ? 'DEMO DATA' : 'PRIVATE WORKSPACE'}</div><h1>Recovery overview</h1></div>{!demo && <form action="/api/logout" method="POST"><button className="button small">Sign out</button></form>}</div>
    <div className="notice">{demo ? <><strong>Demo data only.</strong> Fictional organizations and estimates; no actual food recovery or operating activity. Personal contact details are excluded. <Link href="/dashboard">Administrator login →</Link></> : <>Private pilot planning records. Pickup interest is pending approval. Operational launch requires food safety and regulatory review.</>}</div>
    <div className="metrics"><div><span>{interests.filter(i => i.kind === 'donor').length}</span><p>Potential donors</p></div><div><span>{pickups.length}</span><p>Pickup expressions of interest</p></div><div><span>{recovered.toLocaleString()} <small>lb</small></span><p>Verified pounds recovered</p></div><div><span>${total.toFixed(2)}</span><p>Recorded operating costs</p></div></div>
    <p id="table-help" className="table-help">Tables can scroll horizontally on smaller screens. With a keyboard, focus a table and use the left and right arrow keys.</p>
    <section><h2 id="interests-heading">Donor & interest records</h2>
      <div className="table-wrap" role="region" aria-labelledby="interests-heading" aria-describedby="table-help" tabIndex={0}><table>
        <caption className="sr-only">{demo ? 'Fictional demo' : 'Private'} donor and interest records</caption>
        <thead><tr>{['Organization', 'Type', 'Category', 'ZIP', 'Status', ...(!demo ? ['Private contact'] : [])].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{interests.map((d, i) => <tr key={i}><th scope="row">{String(d.organization)}{!demo && <details className="record-details"><summary>View response<span className="sr-only"> from {String(d.organization)}</span></summary><dl><dt>Estimated surplus</dt><dd>{Number(d.pounds || 0)} lb · {String(d.frequency || 'Unsure')}</dd>{d.kind === 'sponsor' && <><dt>Potential support</dt><dd>{String(d.support_type || 'Not sure yet')}</dd><dt>Public recognition permission</dt><dd>{d.recognition_consent ? 'Given — administrator review required' : 'Not given'}</dd></>}<dt>Message</dt><dd>{String(d.notes || 'No additional message.')}</dd></dl></details>}</th><td>{String(d.kind)}</td><td>{String(d.category)}</td><td>{d.zip ? String(d.zip) : 'Not provided'}</td><td><span className="badge">{String(d.status)}</span></td>{!demo && <td>{String(d.name || '')}<br />{String(d.email || '')}<br />{String(d.phone || '')}</td>}</tr>)}</tbody>
      </table>{!interests.length && <p>No records yet, or your role does not have contact access.</p>}</div>
    </section>
    <section><h2 id="pickups-heading">Pickup requests & status</h2>
      <div className="table-wrap" role="region" aria-labelledby="pickups-heading" aria-describedby="table-help" tabIndex={0}><table>
        <caption className="sr-only">{demo ? 'Fictional demo' : 'Private'} pickup planning records</caption>
        <thead><tr>{['Reference', 'Food category', 'Estimated pounds', 'Actual pounds', 'Status'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{pickups.map((p, i) => <tr key={i}><th scope="row">{String(p.id).slice(0, 12)}</th><td>{String(p.category)}</td><td>{Number(p.estimated_pounds || p.pounds || 0)}</td><td>{p.actual_pounds == null ? 'Not recorded' : Number(p.actual_pounds)}</td><td><span className="badge">{String(p.status)}</span></td></tr>)}</tbody>
      </table>{!pickups.length && <p>No pickup records yet.</p>}</div>
    </section>
    <div className="two-columns"><section><h2>Recipient partners</h2>{partners.length ? partners.map((p, i) => <article className="record" key={i}><strong>{String(p.organization)}</strong><p>{String(p.status)} · {String(p.zip)}</p></article>) : <p>No recipient partners recorded.</p>}</section><section><h2>Impact & operating costs</h2><p>Only completed pickups with actual recorded weights count toward recovery. Estimated surplus is excluded.</p><p>{recovered > 0 ? `$${(total / recovered).toFixed(2)} recorded cost per pound.` : 'Cost per pound: not available until recovery is recorded.'}</p>{costs.map((c, i) => <p key={i}>{String(c.category)}: ${Number(c.amount).toFixed(2)}</p>)}<p className="privacy-note">No meal-equivalent or emissions claims are made without a documented methodology.</p></section></div>
    {children}
  </main>;
}
