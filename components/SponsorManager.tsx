'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Inquiry = { id: string; organization: string; status: string; recognition_consent: boolean };
type Sponsor = { id: string; public_name: string; published: boolean };
export function SponsorManager({ inquiries, sponsors }: { inquiries: Inquiry[]; sponsors: Sponsor[] }) {
  const id = useId();
  const router = useRouter();
  const eligible = inquiries.filter(inquiry => inquiry.recognition_consent && inquiry.status === 'Approved for planning');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (message) feedback.current?.focus(); }, [message]);
  async function save(payload: Record<string, unknown>) {
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
      setFailed(!response.ok); setMessage((await response.json()).message || 'Please try again.');
      if (response.ok) router.refresh();
    } catch { setFailed(true); setMessage('Unable to save. Your entries remain here. Please try again.'); }
    finally { setBusy(false); }
  }
  return <section className="sponsor-manager" aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>Public sponsor recognition</h2><p>There are {inquiries.length} private sponsorship inquiries. Review an inquiry first; only those with recognition permission and “Approved for planning” status appear below. Publication also requires a confirmed agreement.</p>
    {eligible.length ? <form aria-label="Publish sponsor acknowledgment" aria-busy={busy} onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); void save({ action: 'publish', interest_id: data.get('interest_id'), public_description: data.get('public_description'), confirmed: data.get('confirmed') === 'on' }); }}>
      <p className="form-instructions">All fields in this acknowledgment are required.</p>
      <label>Reviewed sponsor inquiry<select name="interest_id" required><option value="">Select an organization</option>{eligible.map(inquiry => <option key={inquiry.id} value={inquiry.id}>{inquiry.organization}</option>)}</select></label>
      <label>Public organizational acknowledgment<textarea name="public_description" required minLength={10} maxLength={280} rows={3} aria-describedby={`${id}-hint`} /></label><p className="privacy-note" id={`${id}-hint`}>Up to 280 characters about the agreed organizational support. Do not include personal names, email addresses, or phone numbers.</p>
      <label className="checkbox"><input type="checkbox" name="confirmed" required />I have confirmed the sponsorship agreement and the organization's permission for this public acknowledgment.</label>
      <button className="button" disabled={busy}>{busy ? 'Publishing…' : 'Publish approved acknowledgment'}</button>
    </form> : <p className="privacy-note">No inquiries are currently eligible for publication. A general contact message or unchecked permission cannot be published.</p>}
    <h3>Published acknowledgments</h3>{sponsors.filter(sponsor => sponsor.published).map(sponsor => <div className="record" key={sponsor.id}><strong>{sponsor.public_name}</strong><br /><button type="button" className="text-link" disabled={busy} onClick={() => void save({ action: 'unpublish', id: sponsor.id })}>Remove from public directory<span className="sr-only">: {sponsor.public_name}</span></button></div>)}
    <p ref={feedback} tabIndex={-1} role={failed ? 'alert' : 'status'} className="form-status">{message}</p>
  </section>;
}
