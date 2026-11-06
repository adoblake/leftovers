'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type TurnstileApi = { render: (container: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }
export function TurnstileCheck({ siteKey, resetKey }: { siteKey: string; resetKey: number }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return;
    widget.current = window.turnstile.render(container.current, {
      sitekey: siteKey, action: 'interest', theme: 'light', size: 'flexible', 'response-field-name': 'turnstileToken',
      callback: () => setFailed(false), 'error-callback': () => setFailed(true), 'expired-callback': () => setFailed(true),
    });
    return () => { if (widget.current && window.turnstile) window.turnstile.remove(widget.current); widget.current = null; };
  }, [ready, siteKey]);
  useEffect(() => { if (resetKey && widget.current && window.turnstile) window.turnstile.reset(widget.current); }, [resetKey]);
  return <div className="bot-check"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setFailed(true)} /><div ref={container} />{failed && <p role="alert">The spam check needs attention. <button type="button" className="copy-button" onClick={() => { if (widget.current && window.turnstile) { window.turnstile.reset(widget.current); setFailed(false); } else window.location.reload(); }}>Retry the check</button></p>}</div>;
}
