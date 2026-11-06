'use client';
import { useState } from 'react';
import { Icon } from './Icon';

export function RegistrationShare() {
  const [message, setMessage] = useState('');
  return <div className="share-registration"><h3>Know a food business?</h3><p>Share our short, QR-friendly registration address.</p><code>/register</code><br /><button type="button" className="copy-button" onClick={async () => {
    const url = new URL('/register', window.location.origin).href;
    try { await navigator.clipboard.writeText(url); setMessage('Registration link copied.'); }
    catch { setMessage(`Copy this link: ${url}`); }
  }}><Icon name="copy" width="14" height="14" /> Copy registration link</button><p role="status">{message}</p></div>;
}
