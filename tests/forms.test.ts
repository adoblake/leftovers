import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { interestSchema, timingValid } from '../lib/validation';

const { insert } = vi.hoisted(() => ({ insert: vi.fn(async () => ({ error: null as Error | null })) }));
vi.mock('../lib/supabase', () => ({ db: vi.fn(() => ({ from: () => ({ insert }) })) }));
vi.mock('node:fs/promises', () => ({ mkdir: vi.fn(async () => {}), appendFile: vi.fn(async () => {}) }));
import { POST } from '../app/api/interest/route';
import { appendFile } from 'node:fs/promises';

const good = () => ({
  kind: 'donor', organization: 'Example Kitchen', name: 'Demo Person', email: 'demo@example.org',
  phone: '', zip: '85004', category: 'Produce', pounds: 20, frequency: 'Weekly',
  notes: 'Interested in the proposed Phoenix pilot.', consent: true, website: '', startedAt: Date.now() - 5000,
});
let ip = 0;
function request(data: unknown, origin = 'http://localhost:3000') {
  return new NextRequest('http://localhost:3000/api/interest', {
    method: 'POST', headers: { 'Content-Type': 'application/json', origin, 'x-forwarded-for': `test-${ip++}` }, body: JSON.stringify(data),
  });
}
beforeEach(() => {
  vi.stubEnv('DATA_MODE', 'demo'); vi.stubEnv('APP_ORIGIN', 'http://localhost:3000'); vi.stubEnv('NODE_ENV', 'test');
  vi.clearAllMocks(); insert.mockResolvedValue({ error: null });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('critical interest form flows', () => {
  for (const kind of ['donor', 'survey', 'pickup', 'contact', 'sponsor']) {
    it(`accepts a valid ${kind} response and explicitly labels local demo storage`, async () => {
      const response = await POST(request({ ...good(), kind }));
      expect(response.status).toBe(201); expect(appendFile).toHaveBeenCalledOnce();
      expect((await response.json()).message).toContain('Demo');
    });
  }
  it('accepts a contact inquiry without an organization or location and normalizes storage', async () => {
    const response = await POST(request({ ...good(), kind: 'contact', organization: '', zip: '', topic: 'partner', category: 'Not applicable' }));
    expect(response.status).toBe(201);
    const row = JSON.parse(String(vi.mocked(appendFile).mock.calls[0][1]));
    expect(row.organization).toBe('Individual inquiry'); expect(row.zip).toBeNull();
    expect(row.notes).toContain('[Recipient partnership]');
    expect(row).not.toHaveProperty('topic'); expect(row).not.toHaveProperty('startedAt');
    expect(row).not.toHaveProperty('website');
  });
  it('stores a private sponsorship inquiry without automatically publishing it', async () => {
    const response = await POST(request({ ...good(), kind: 'sponsor', zip: '', category: 'Not applicable', support_type: 'Transport', sponsor_website: 'https://business.example.org', recognition_consent: false }));
    expect(response.status).toBe(201);
    const row = JSON.parse(String(vi.mocked(appendFile).mock.calls[0][1]));
    expect(row.kind).toBe('sponsor'); expect(row.zip).toBeNull(); expect(row.recognition_consent).toBe(false); expect(row.support_type).toBe('Transport');
    expect(row.status).toBe('Interest received'); expect(row).not.toHaveProperty('published'); expect(row).not.toHaveProperty('turnstileToken');
  });
  it('rejects unsafe sponsor website schemes and missing organization names', () => {
    expect(interestSchema.safeParse({ ...good(), kind: 'sponsor', sponsor_website: 'javascript:alert(1)' }).success).toBe(false);
    expect(interestSchema.safeParse({ ...good(), kind: 'sponsor', organization: '' }).success).toBe(false);
  });
  it('accepts a non-Phoenix contact ZIP without extending donor eligibility', async () => {
    expect((await POST(request({ ...good(), kind: 'contact', zip: '10001' }))).status).toBe(201);
    expect((await POST(request({ ...good(), zip: '10001' }))).status).toBe(400);
  });
  it('requires an actual message for contact and privacy inquiries', async () => {
    expect((await POST(request({ ...good(), kind: 'contact', topic: 'privacy', notes: '' }))).status).toBe(400);
    expect(appendFile).not.toHaveBeenCalled();
  });
  it('returns email field errors without writing or echoing personal details', async () => {
    const response = await POST(request({ ...good(), email: 'bad' }));
    expect(response.status).toBe(400); const body = await response.json();
    expect(body.fields.email).toBe('Enter a valid email address.');
    expect(JSON.stringify(body)).not.toContain('Demo Person'); expect(appendFile).not.toHaveBeenCalled();
  });
  it('requires consent for every kind of submission', async () => {
    for (const kind of ['donor', 'survey', 'pickup', 'contact', 'sponsor']) expect((await POST(request({ ...good(), kind, consent: false }))).status).toBe(400);
    expect(appendFile).not.toHaveBeenCalled();
  });
  it('requires an organization and Phoenix-area ZIP for food-related interest', async () => {
    for (const kind of ['donor', 'survey', 'pickup']) {
      const response = await POST(request({ ...good(), kind, organization: '', zip: '' }));
      expect(response.status).toBe(400); expect((await response.json()).fields).toHaveProperty('zip');
    }
  });
  it('rejects honeypot submissions', async () => {
    expect((await POST(request({ ...good(), website: 'spam' }))).status).toBe(400); expect(appendFile).not.toHaveBeenCalled();
  });
  it('rejects a submission too fast or with an expired form timestamp', async () => {
    expect((await POST(request({ ...good(), startedAt: Date.now() }))).status).toBe(400);
    expect((await POST(request({ ...good(), startedAt: Date.now() - 86400001 }))).status).toBe(400);
    expect(appendFile).not.toHaveBeenCalled();
  });
  it('rejects cross-origin writes', async () => expect((await POST(request(good(), 'https://other.example'))).status).toBe(403));
  it('rejects malformed JSON as a validation failure', async () => {
    const req = new NextRequest('http://localhost:3000/api/interest', { method: 'POST', headers: { origin: 'http://localhost:3000' }, body: '{' });
    expect((await POST(req)).status).toBe(400); expect(appendFile).not.toHaveBeenCalled();
  });
  it('rejects oversized bodies', async () => expect((await POST(request({ ...good(), notes: 'x'.repeat(17000) }))).status).toBe(413));
  it('requires a food category and positive survey weight', () => {
    expect(interestSchema.safeParse({ ...good(), kind: 'survey', pounds: 0 }).success).toBe(false);
    expect(interestSchema.safeParse({ ...good(), category: 'Not applicable' }).success).toBe(false);
  });
  it('never accepts a client-supplied approval status', async () => {
    await POST(request({ ...good(), status: 'Approved', role: 'admin' }));
    const row = JSON.parse(String(vi.mocked(appendFile).mock.calls[0][1]));
    expect(row.status).toBe('Interest received'); expect(row).not.toHaveProperty('role');
  });
  it('uses database storage exclusively in configured Supabase mode', async () => {
    vi.stubEnv('DATA_MODE', 'supabase');
    const response = await POST(request(good())); expect(response.status).toBe(201);
    expect(insert).toHaveBeenCalledOnce(); expect(appendFile).not.toHaveBeenCalled();
    expect((await response.json()).message).not.toContain('Demo');
  });
  it('does not claim success if database storage fails', async () => {
    vi.stubEnv('DATA_MODE', 'supabase'); insert.mockResolvedValueOnce({ error: new Error('Database unavailable') });
    expect((await POST(request(good()))).status).toBe(503); expect(appendFile).not.toHaveBeenCalled();
  });
  it('rejects a failed live bot challenge before any database write', async () => {
    vi.stubEnv('DATA_MODE','supabase');vi.stubEnv('NODE_ENV','production');vi.stubEnv('TURNSTILE_SECRET_KEY','fictional-secret');vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY','fictional-public-key');
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:false}),{status:200})));
    expect((await POST(request({...good(),turnstileToken:'fictional-token'}))).status).toBe(400);expect(insert).not.toHaveBeenCalled();expect(appendFile).not.toHaveBeenCalled();
  });
  it('fails closed for unconfigured production storage', async () => {
    vi.stubEnv('NODE_ENV', 'production'); expect((await POST(request(good()))).status).toBe(503);
    expect(appendFile).not.toHaveBeenCalled();
  });
  it('checks form-duration boundaries', () => {
    expect(timingValid(1000, 3500)).toBe(true); expect(timingValid(1000, 3499)).toBe(false); expect(timingValid(1000, 86401000)).toBe(false);
  });
  it('rate limits repeated writes and gives a retry time', async () => {
    const id = `rate-${ip++}`; let response;
    for (let n = 0; n < 6; n++) { const req = request(good()); req.headers.set('x-forwarded-for', id); response = await POST(req); }
    expect(response?.status).toBe(429); expect(response?.headers.get('Retry-After')).toBe('900');
  });
});
