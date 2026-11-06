import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { getDataMode, isAllowedOrigin } from '../lib/runtime-config';
import { NextRequest } from 'next/server';

vi.mock('../lib/supabase', () => ({ db: vi.fn(() => { throw new Error('No database should be used by a preview'); }) }));
vi.mock('node:fs/promises', () => ({ mkdir: vi.fn(), appendFile: vi.fn() }));
import { POST } from '../app/api/interest/route';
import { POST as login } from '../app/api/auth/route';
import { appendFile } from 'node:fs/promises';
import { db } from '../lib/supabase';

const payload = () => ({ kind: 'donor', organization: 'Fictional Preview Business', name: 'Demo Person', email: 'demo@example.org', zip: '85004', category: 'Produce', pounds: 10, frequency: 'Weekly', notes: '', consent: true, website: '', startedAt: Date.now() - 5000 });
let requestId = 0;
beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('DATA_MODE', ''); vi.stubEnv('APP_ORIGIN', '');
  vi.stubEnv('VERCEL_URL', 'leftovers-preview-example.vercel.app'); vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'leftovers-project-example.vercel.app');
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllEnvs());

it('defaults production to a non-persistent public preview', () => expect(getDataMode()).toBe('preview'));
it('retains local development storage when no mode is specified', () => { vi.stubEnv('NODE_ENV', 'development'); expect(getDataMode()).toBe('demo'); });
it('accepts the trusted Vercel preview and project origins', () => {
  expect(isAllowedOrigin('https://leftovers-preview-example.vercel.app')).toBe(true);
  expect(isAllowedOrigin('https://leftovers-project-example.vercel.app')).toBe(true);
  expect(isAllowedOrigin('https://another-project.vercel.app')).toBe(false);
});
it('validates a production form without saving, notifying, or echoing personal information', async () => {
  const req = new NextRequest('https://leftovers-preview-example.vercel.app/api/interest', { method: 'POST', headers: { origin: 'https://leftovers-preview-example.vercel.app', 'x-forwarded-for': `preview-${requestId++}` }, body: JSON.stringify(payload()) });
  const response = await POST(req); const body = await response.json();
  expect(response.status).toBe(200); expect(body.stored).toBe(false); expect(body.message).toContain('Nothing has been saved');
  expect(JSON.stringify(body)).not.toContain('demo@example.org'); expect(appendFile).not.toHaveBeenCalled(); expect(db).not.toHaveBeenCalled();
});
it('still rejects invalid preview forms', async () => {
  const req = new NextRequest('https://leftovers-preview-example.vercel.app/api/interest', { method: 'POST', headers: { origin: 'https://leftovers-preview-example.vercel.app', 'x-forwarded-for': `preview-${requestId++}` }, body: JSON.stringify({ ...payload(), consent: false }) });
  expect((await POST(req)).status).toBe(400); expect(appendFile).not.toHaveBeenCalled();
});
it('does not accept a forged host header as an allowed origin', async () => {
  const req = new NextRequest('https://attacker.example/api/interest', { method: 'POST', headers: { origin: 'https://attacker.example', host: 'attacker.example', 'x-forwarded-host': 'attacker.example' }, body: JSON.stringify(payload()) });
  expect((await POST(req)).status).toBe(403);
});
it('uses an explicitly configured custom domain without accepting arbitrary origins', () => {
  vi.stubEnv('APP_ORIGIN', 'https://pilot.example.org');
  expect(isAllowedOrigin('https://pilot.example.org')).toBe(true); expect(isAllowedOrigin('https://pilot.example.org.attacker.test')).toBe(false);
});
it('does not create staff sessions in public preview mode', async () => {
  const req = new NextRequest('https://leftovers-preview-example.vercel.app/api/auth', { method: 'POST', headers: { origin: 'https://leftovers-preview-example.vercel.app' }, body: JSON.stringify({ email: 'demo@example.org', password: 'fictional' }) });
  const response = await login(req); expect(response.status).toBe(503); expect(response.headers.get('set-cookie')).toBeNull(); expect(db).not.toHaveBeenCalled();
});

it('accepts exact trusted Netlify deployment origins and rejects lookalike hosts', () => {
  vi.stubEnv('URL','https://leftovers-example.netlify.app'); vi.stubEnv('DEPLOY_PRIME_URL','https://branch--leftovers-example.netlify.app');
  expect(isAllowedOrigin('https://leftovers-example.netlify.app')).toBe(true);
  expect(isAllowedOrigin('https://branch--leftovers-example.netlify.app')).toBe(true);
  expect(isAllowedOrigin('https://leftovers-example.netlify.app.attacker.test')).toBe(false);
});
