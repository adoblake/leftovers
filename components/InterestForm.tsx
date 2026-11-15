'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { interestSchema, supportTypes, type ContactTopic, type InterestKind } from '@/lib/validation';
import { Icon } from './Icon';
import { TurnstileCheck } from './TurnstileCheck';

type Topic = ContactTopic;
export function InterestForm({ kind, topic = 'general', preview = false, turnstileSiteKey }: { kind: InterestKind; topic?: Topic; preview?: boolean; turnstileSiteKey?: string }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [challengeReset, setChallengeReset] = useState(0);
  const isContact = kind === 'contact';
  const isSponsor = kind === 'sponsor';
  const isConversation = isContact || isSponsor;
  const fieldLabels: Record<string, string> = {
    organization: isContact ? 'Organization' : 'Organization or household name', name: 'Your name',
    email: 'Email address', phone: 'Phone', zip: isConversation ? 'ZIP code' : 'Phoenix-area ZIP code',
    category: 'Food category', frequency: 'Surplus frequency', pounds: 'Estimated pounds',
    notes: isSponsor ? 'Potential support message' : isContact ? 'Your message' : 'Additional information',
    support_type: 'Potential support', sponsor_website: 'Organization website', consent: 'Contact permission',
    recognition_consent: 'Public recognition permission',
  };

  useEffect(() => { setStartedAt(Date.now()); }, []);
  useEffect(() => { if (done) successRef.current?.focus(); }, [done]);

  function inputProps(field: string) {
    const descriptions = [errors[field] ? `${id}-${field}-error` : '', ['zip', 'pounds', 'notes'].includes(field) ? `${id}-${field}-hint` : ''].filter(Boolean);
    return { id: `${id}-${field}`, 'aria-labelledby': `${id}-${field}-label`, 'aria-invalid': errors[field] ? true as const : undefined, 'aria-describedby': descriptions.length ? descriptions.join(' ') : undefined };
  }
  function error(field: string) {
    return errors[field] ? <span id={`${id}-${field}-error`} className="field-error">{errors[field]}</span> : null;
  }
  function showErrors(fields: Record<string, string>) {
    setErrors(fields);
    requestAnimationFrame(() => {
      errorRef.current?.focus();
    });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setMessage('');
    const formData = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(formData), kind, startedAt,
      consent: formData.get('consent') === 'on',
      recognition_consent: formData.get('recognition_consent') === 'on',
      turnstileToken: String(formData.get('turnstileToken') || ''),
      pounds: Number(formData.get('pounds') || 0),
      category: isConversation ? 'Not applicable' : formData.get('category'),
      frequency: isConversation ? 'Unsure' : formData.get('frequency'),
    };
    const result = interestSchema.safeParse(payload);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) fields[String(issue.path[0])] ??= issue.message;
      showErrors(fields);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const response = await fetch('/api/interest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      setMessage(data.message || 'Please try again.');
      if (response.ok) setDone(true);
      else if (data.fields) showErrors(data.fields);
    } catch {
      setMessage('We couldn’t confirm your submission. Check your connection and try again.');
    } finally { setBusy(false); setChallengeReset(value => value + 1); }
  }

  if (done) return <div className="success-card" ref={successRef} tabIndex={-1} role="region" aria-labelledby={`${id}-success`}>
    <span className="success-icon"><Icon name="check" width="26" height="26" /></span>
    <h2 id={`${id}-success`}>{preview ? 'Demo complete.' : isConversation ? 'Thanks for starting a conversation.' : 'You’ve taken the first step.'}</h2>
    <p role="status">{message}</p>
    {!isContact && !preview && <p>Your submission is an expression of interest. It does not confirm a partnership, sponsorship agreement, pickup, or service availability.</p>}
    <Link className="text-link" href="/how-it-works">What happens next <Icon name="arrow" width="16" height="16" /></Link>
    <button className="text-link" type="button" onClick={() => { setDone(false); setMessage(''); setErrors({}); setStartedAt(Date.now()); }}>Submit another response</button>
  </div>;

  return <form ref={formRef} noValidate onSubmit={submit} className="interest-form" aria-busy={busy} onChange={event => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
      const name = target.name;
      if (errors[name]) setErrors(current => { const next = { ...current }; delete next[name]; return next; });
    }
  }}>
    <p className="form-instructions">Fields are required unless marked optional.</p>
    {Object.keys(errors).length > 0 && <div className="error-summary" role="alert" ref={errorRef} tabIndex={-1} aria-labelledby={`${id}-error-heading`}><h2 id={`${id}-error-heading`}>Check your response</h2><p>Please check the highlighted fields below.</p><ul>{Object.entries(errors).map(([field, text]) => <li key={field}>{fieldLabels[field] ? <a href={`#${id}-${field}`} onClick={event => { event.preventDefault(); const input = formRef.current?.elements.namedItem(field); if (input instanceof HTMLElement) input.focus(); }}>{fieldLabels[field]}: {text}</a> : 'Please refresh the form and try again.'}</li>)}</ul></div>}
    <fieldset><legend><span className="legend-number">01</span>{isContact ? 'Let’s start with you' : 'A little about you'}</legend>
      <label htmlFor={`${id}-organization`}><span id={`${id}-organization-label`}>{isContact ? 'Organization (optional)' : 'Organization or household name'}</span>
        <input {...inputProps('organization')} name="organization" required={!isContact} minLength={2} maxLength={160} autoComplete="organization" placeholder={isContact ? 'Your organization, if applicable' : isSponsor ? 'Your business or organization' : 'e.g. your restaurant, bakery, or market'} />{error('organization')}
      </label>
      <div className="form-grid"><label htmlFor={`${id}-name`}><span id={`${id}-name-label`}>Your name</span><input {...inputProps('name')} name="name" required minLength={2} maxLength={100} autoComplete="name" />{error('name')}</label>
        <label htmlFor={`${id}-email`}><span id={`${id}-email-label`}>Email address</span><input {...inputProps('email')} name="email" type="email" required maxLength={254} autoComplete="email" />{error('email')}</label>
        <label htmlFor={`${id}-phone`}><span id={`${id}-phone-label`}>Phone (optional)</span><input {...inputProps('phone')} name="phone" type="tel" maxLength={30} autoComplete="tel" />{error('phone')}</label>
        <label htmlFor={`${id}-zip`}><span id={`${id}-zip-label`}>{isConversation ? 'ZIP code (optional)' : 'Phoenix-area ZIP code'}</span><input {...inputProps('zip')} name="zip" required={!isConversation} pattern={isConversation ? '[0-9]{5}' : '85[0-9]{3}'} inputMode="numeric" maxLength={5} autoComplete="postal-code" />{error('zip')}<small id={`${id}-zip-hint`}>{isConversation ? 'Five digits, if provided.' : 'Five digits beginning with 85. Exact pilot area is still being reviewed.'}</small></label>
      </div>
    </fieldset>
    <fieldset><legend><span className="legend-number">02</span>{isSponsor ? 'How would you like to help?' : isContact ? 'What’s on your mind?' : kind === 'survey' ? 'Help us understand your surplus' : 'Tell us about your food'}</legend>
      {isSponsor ? <div className="form-grid"><label htmlFor={`${id}-support_type`}><span id={`${id}-support_type-label`}>Potential support</span><select {...inputProps('support_type')} name="support_type" defaultValue="Not sure yet">{supportTypes.map(value => <option key={value}>{value}</option>)}</select>{error('support_type')}</label><label htmlFor={`${id}-sponsor_website`}><span id={`${id}-sponsor_website-label`}>Organization website (optional)</span><input {...inputProps('sponsor_website')} name="sponsor_website" type="url" maxLength={300} placeholder="https://" />{error('sponsor_website')}</label></div> : isContact ? <label htmlFor={`${id}-topic`}>I’d like to talk about<select id={`${id}-topic`} name="topic" defaultValue={topic}><option value="general">A question or idea</option><option value="partner">Recipient partnership</option><option value="privacy">My information / a privacy request</option></select></label> : <div className="form-grid">
        <label htmlFor={`${id}-category`}><span id={`${id}-category-label`}>Food category</span><select {...inputProps('category')} name="category" defaultValue="" required><option value="" disabled>Select a category</option>{['Produce', 'Prepared meals', 'Bakery', 'Packaged goods', 'Mixed'].map(value => <option key={value}>{value}</option>)}</select>{error('category')}</label>
        <label htmlFor={`${id}-frequency`}><span id={`${id}-frequency-label`}>How often is there surplus?</span><select {...inputProps('frequency')} name="frequency" defaultValue="Unsure">{['One time', 'Weekly', 'Monthly', 'Unsure'].map(value => <option key={value}>{value}</option>)}</select>{error('frequency')}</label>
        <label htmlFor={`${id}-pounds`}><span id={`${id}-pounds-label`}>Estimated pounds {kind !== 'survey' && '(optional)'}</span><input {...inputProps('pounds')} name="pounds" type="number" min={kind === 'survey' ? 0.1 : 0} max={100000} step="0.1" required={kind === 'survey'} placeholder="e.g. 25" />{error('pounds')}<small id={`${id}-pounds-hint`}>Your best estimate is enough for planning.</small></label>
      </div>}
      <label htmlFor={`${id}-notes`}><span id={`${id}-notes-label`}>{isSponsor ? 'Tell us about your potential support' : isContact ? 'Your message' : 'Anything else we should know? (optional)'}</span><textarea {...inputProps('notes')} name="notes" required={isConversation} minLength={isConversation ? 10 : undefined} maxLength={2000} rows={5} placeholder={isSponsor ? 'Share the resources, expertise, or funding you’d like to discuss. Please do not include payment details.' : isContact ? 'Share your question, your organization’s needs, or how you’d like to get involved.' : 'Food types, storage conditions, timing, or questions. Please avoid sensitive information.'} />{error('notes')}<small id={`${id}-notes-hint`}>Up to 2,000 characters. Please don’t share financial, medical, or other sensitive information.</small></label>
    </fieldset>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {isSponsor && <label className="checkbox" htmlFor={`${id}-recognition_consent`}><input {...inputProps('recognition_consent')} name="recognition_consent" type="checkbox" /><span id={`${id}-recognition_consent-label`}>Optional: if a sponsorship is agreed, I allow publication of my organization’s name, website, and approved acknowledgment. My personal contact details must stay private.</span></label>}
    <label className="checkbox" htmlFor={`${id}-consent`}><input {...inputProps('consent')} name="consent" type="checkbox" required /><span><span id={`${id}-consent-label`}>{isSponsor ? 'I agree to be contacted about this sponsorship inquiry. I understand no payment, partnership, or sponsorship agreement is confirmed.' : 'I agree to be contacted about my submission. I understand this pilot is in development and this is not a confirmed pickup or service commitment.'}</span>{error('consent')}</span></label>
    {turnstileSiteKey && <TurnstileCheck siteKey={turnstileSiteKey} resetKey={challengeReset} />}
    <p className="privacy-note">{preview ? 'Use fictional details only. This demonstration validates your response without saving it or notifying anyone.' : 'Your contact details stay private and are used to review and respond to your submission.'} Read about <Link href="/privacy">your information and privacy</Link>.</p>
    <div className="form-footer"><button className="button" disabled={busy || !startedAt}>{busy ? 'Submitting…' : preview ? 'Try this form' : isSponsor ? 'Submit sponsorship inquiry' : isContact ? 'Send your message' : 'Submit interest'}{!busy && <Icon name="arrow" width="18" height="18" />}</button><span><Icon name="lock" width="12" height="12" /> {preview ? 'Demo only · No response stored' : 'Contact information stays private'}</span></div>
    {!done && message && <p className="form-status" role="alert">{message}</p>}
  </form>;
}
