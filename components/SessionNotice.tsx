'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Login } from './Login';

export function SessionNotice({ expiresAt: initialExpiry }: { expiresAt: number }) {
  const id = useId();
  const [expiresAt, setExpiresAt] = useState(initialExpiry);
  const [now, setNow] = useState(initialExpiry - 3600000);
  const [signInVersion, setSignInVersion] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = expiresAt - now;
  const warning = remaining <= 120000;
  return <section className="session-notice" aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`}>Keep your workspace open</h2>
    <p role="status" aria-live="polite" aria-atomic="true">{remaining <= 0 ? 'Your staff session has expired. Sign in again before saving. Your unsaved fields remain on this page.' : warning ? 'Your staff session expires in less than two minutes. Sign in again to keep working without losing your entries.' : 'Staff sessions last up to one hour. Renew your session here without clearing unsaved fields.'}</p>
    <button type="button" className="text-link" onClick={() => dialog.current?.showModal()}>Renew staff session</button>
    <dialog className="session-dialog" ref={dialog} onClose={() => setSignInVersion(version => version + 1)} aria-labelledby={`${id}-dialog-title`} aria-describedby={`${id}-dialog-description`}>
      <h2 id={`${id}-dialog-title`}>Renew your staff session</h2>
      <p id={`${id}-dialog-description`}>Sign in again to continue. Your unsaved work stays on the page while this window is open.</p>
      <Login key={signInVersion} onSignedIn={nextExpiry => { setExpiresAt(nextExpiry); setNow(Date.now()); dialog.current?.close(); }} />
      <button type="button" className="text-link" onClick={() => dialog.current?.close()}>Close and return to your work</button>
    </dialog>
  </section>;
}
