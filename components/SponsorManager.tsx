'use client';
import { useState } from 'react';

type Inquiry = { id: string; organization: string; status: string; recognition_consent: boolean };
type Sponsor = { id: string; public_name: string; published: boolean };
export function SponsorManager({ inquiries, sponsors }: { inquiries: Inquiry[]; sponsors: Sponsor[] }) {
  const eligible = inquiries.filter(inquiry => inquiry.recognition_consent && inquiry.status === 'Approved for planning');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(payload: Record<string, unknown>) {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setMessage((await response.json()).message);
      if (response.ok) window.location.reload();
    } catch { setMessage('Unable to save. Please try again.'); }
    finally { setBusy(false); }
  }
  return <section className="sponsor-manager"><h2>Public sponsor recognition</h2><p>There are {inquiries.length} private sponsorship inquiries. Review an inquiry first; only those with recognition permission and “Approved for planning” status appear below. Publication also requires a confirmed agreement.</p>
    {eligible.length ? <form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); void save({ action: 'publish', interest_id: data.get('interest_id'), public_description: data.get('public_description'), confirmed: data.get('confirmed') === 'on' }); }}>
      <label>Reviewed sponsor inquiry<select name="interest_id" required><option value="">Select an organization</option>{eligible.map(inquiry => <option key={inquiry.id} value={inquiry.id}>{inquiry.organization}</option>)}</select></label>
      <label>Public organizational acknowledgment<textarea name="public_description" required minLength={10} maxLength={280} rows={3} placeholder="Describe the agreed organizational support. Do not include names, email addresses, or phone numbers of individual contacts." /></label>
      <label className="checkbox"><input type="checkbox" name="confirmed" required />I have confirmed the sponsorship agreement and the organization's permission for this public acknowledgment.</label>
      <button className="button" disabled={busy}>Publish approved acknowledgment</button>
    </form> : <p className="privacy-note">No inquiries are currently eligible for publication. A general contact message or unchecked permission cannot be published.</p>}
    <h3>Published acknowledgments</h3>{sponsors.filter(sponsor => sponsor.published).map(sponsor => <div className="record" key={sponsor.id}><strong>{sponsor.public_name}</strong><br /><button type="button" className="text-link" disabled={busy} onClick={() => void save({ action: 'unpublish', id: sponsor.id })}>Remove from public directory</button></div>)}
    <p role="status">{message}</p>
  </section>;
}
