'use client';
import { useEffect, useId, useRef, useState } from 'react';

export function Login({ onSignedIn }: { onSignedIn?: (expiresAt: number) => void }) {
  const id = useId();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const error = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (message) error.current?.focus(); }, [message]);
  return <form className="login-form" aria-label="Staff sign-in" aria-busy={busy} onSubmit={async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(fields)), signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (response.ok) {
        if (onSignedIn) {
          if (Number.isFinite(data.expiresAt) && data.expiresAt > Date.now()) onSignedIn(data.expiresAt);
          else setMessage('Session renewal could not be confirmed. Your entries remain on this page. Please try again.');
        } else window.location.reload();
      } else setMessage(data.message || 'Unable to sign in. Please try again.');
    } catch { setMessage('Sign-in unavailable. Please try again.'); }
    finally { setBusy(false); }
  }}>
    <p className="form-instructions">Both fields are required. You can paste your password or use a password manager.</p>
    <label htmlFor={`${id}-email`}>Email<input id={`${id}-email`} name="email" type="email" autoComplete="username" required maxLength={254} /></label>
    <label htmlFor={`${id}-password`}>Password<input id={`${id}-password`} name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={256} /></label>
    <button className="text-link password-toggle" type="button" aria-controls={`${id}-password`} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? 'Hide password' : 'Show password'}</button>
    <button className="button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely →'}</button>
    <p className="form-status" role="alert" tabIndex={-1} ref={error}>{message}</p>
  </form>;
}
