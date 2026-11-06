export type DataMode = 'demo' | 'preview' | 'supabase';

export function getDataMode(): DataMode {
  const mode = process.env.DATA_MODE;
  if (mode === 'demo' || mode === 'preview' || mode === 'supabase') return mode;
  if (mode) throw new Error('DATA_MODE must be demo, preview, or supabase.');
  return process.env.NODE_ENV === 'production' ? 'preview' : 'demo';
}

// Only explicit configuration and trusted hosting variables define accepted origins.
// Never trust an incoming Host or forwarded-host header to authorize a write.
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = new Set<string>();
  if (process.env.APP_ORIGIN) {
    try {
      const url = new URL(process.env.APP_ORIGIN);
      if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) allowed.add(url.origin);
    } catch { return false; }
  }
  for (const hostname of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (hostname && /^[a-zA-Z0-9.-]+$/.test(hostname)) allowed.add(`https://${hostname}`);
  }
  for (const value of [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL]) {
    if (!value) continue;
    try { const url = new URL(value); if (url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) allowed.add(url.origin); } catch { /* Invalid hosting configuration does not authorize an origin. */ }
  }
  if (!allowed.size && !process.env.APP_ORIGIN) allowed.add('http://localhost:3000');
  return allowed.has(origin);
}
