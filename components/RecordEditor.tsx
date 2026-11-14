'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { admin: boolean; interests: { id: string; organization: string; kind?: string }[]; pickups: { id: string }[] };
export function RecordEditor({ admin, interests, pickups }: Props) {
  const id = useId();
  const router = useRouter();
  const [action, setAction] = useState('review');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (message) feedback.current?.focus(); }, [message]);
  return <section aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>Manage pilot planning</h2><p>Changes are subject to your role. Scheduling and completion remain disabled in this pre-launch MVP.</p>
    <label>Action<select value={action} onChange={event => { setAction(event.target.value); setMessage(''); }}><option value="review">Review interest</option><option value="partner">Add recipient partner</option><option value="pickup">Create pickup planning record</option><option value="status">Update pickup planning status</option>{admin && <option value="cost">Record operating cost</option>}</select></label>
    <form key={action} aria-label="Pilot planning record" aria-busy={busy} onSubmit={async event => {
      event.preventDefault(); if (busy) return;
      setBusy(true); setMessage('');
      try {
        const fields = Object.fromEntries(new FormData(event.currentTarget));
        const response = await fetch('/api/records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, action }), signal: AbortSignal.timeout(20000) });
        setFailed(!response.ok); setMessage((await response.json()).message || 'Please try again.');
        if (response.ok) router.refresh();
      } catch { setFailed(true); setMessage('Unable to save. Your entries remain here. Please try again.'); }
      finally { setBusy(false); }
    }}>
      <p className="form-instructions">All fields in this record are required.</p>
      {(action === 'review' || action === 'pickup') && <label>Interest record<select name={action === 'review' ? 'id' : 'interest_id'} required><option value="">Select a record</option>{interests.filter(i => action !== 'pickup' || ['donor', 'survey', 'pickup'].includes(i.kind || '')).map(i => <option value={i.id} key={i.id}>{i.organization} · {i.id.slice(0, 8)}</option>)}</select></label>}
      {action === 'status' && <label>Pickup record<select name="id" required><option value="">Select a record</option>{pickups.map(p => <option key={p.id}>{p.id}</option>)}</select></label>}
      {(action === 'review' || action === 'status') && <label>Status<select name="status">{['Interest received', 'Under review', 'Approved for planning', action === 'review' ? 'Declined' : 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select></label>}
      {action === 'partner' && <><label>Organization<input name="organization" required minLength={2} maxLength={160} autoComplete="organization" /></label><label>ZIP<input name="zip" required pattern="85[0-9]{3}" inputMode="numeric" maxLength={5} aria-describedby={`${id}-zip-hint`} autoComplete="postal-code" /></label><p className="privacy-note" id={`${id}-zip-hint`}>Five digits beginning with 85.</p></>}
      {action === 'pickup' && <><label>Food category<select name="category">{['Produce', 'Prepared meals', 'Bakery', 'Packaged goods', 'Mixed'].map(c => <option key={c}>{c}</option>)}</select></label><label>Estimated pounds<input name="estimated_pounds" type="number" min="0" max="100000" step="0.1" required /></label></>}
      {action === 'cost' && <><label>Cost category<input name="category" required minLength={2} maxLength={100} /></label><label>Amount (USD)<input name="amount" type="number" min="0" max="1000000" step="0.01" required /></label><label>Date incurred<input name="incurred_on" type="date" required /></label></>}
      <button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save record'}</button>
    </form>
    <p ref={feedback} tabIndex={-1} role={failed ? 'alert' : 'status'} className="form-status">{message}</p>
  </section>;
}
