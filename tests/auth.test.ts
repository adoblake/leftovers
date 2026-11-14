import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const { signIn, profile } = vi.hoisted(() => ({ signIn: vi.fn(), profile: vi.fn() }));
vi.mock('../lib/supabase', () => ({ db: () => ({ auth: { signInWithPassword: signIn }, from: () => ({ select: () => ({ eq: () => ({ single: profile }) }) }) }) }));
import { POST } from '../app/api/auth/route';
let ip = 0;
function request(origin = 'http://localhost:3000') {
  return new NextRequest('http://localhost:3000/api/auth', { method: 'POST', headers: { origin, 'Content-Type': 'application/json', 'x-forwarded-for': `auth-fixture-${ip++}` }, body: JSON.stringify({ email: 'demo@example.org', password: 'fictional-password' }) });
}
beforeEach(() => {
  vi.stubEnv('DATA_MODE', 'supabase'); vi.stubEnv('APP_ORIGIN', 'http://localhost:3000'); vi.stubEnv('NODE_ENV', 'production');
  vi.clearAllMocks();
  signIn.mockResolvedValue({ data: { user: { id: 'fictional-user' }, session: { access_token: 'fictional-token', expires_in: 7200 } }, error: null });
  profile.mockResolvedValue({ data: { role: 'admin' } });
});
afterEach(() => vi.unstubAllEnvs());
it('provides a capped renewal deadline while keeping the session in a secure HTTP-only cookie', async () => {
  const before = Date.now();
  const response = await POST(request()); const body = await response.json();
  expect(response.status).toBe(200); expect(body.ok).toBe(true);
  expect(body.expiresAt).toBeGreaterThanOrEqual(before + 3600000);
  expect(body.expiresAt).toBeLessThanOrEqual(Date.now() + 3600000);
  expect(body).not.toHaveProperty('access_token'); expect(body).not.toHaveProperty('password');
  const cookie = response.cookies.get('leftovers_session')!;
  expect(cookie).toMatchObject({ value: 'fictional-token', httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600 });
});
it('keeps a shorter real token lifetime rather than extending it in the browser', async () => {
  signIn.mockResolvedValue({ data: { user: { id: 'fictional-user' }, session: { access_token: 'fictional-token', expires_in: 120 } }, error: null });
  const before = Date.now(); const response = await POST(request());
  expect(response.cookies.get('leftovers_session')?.maxAge).toBe(120);
  expect((await response.json()).expiresAt).toBeGreaterThanOrEqual(before + 120000);
});
it('rejects session renewal when the account has no authorized staff role', async () => {
  profile.mockResolvedValue({ data: { role: 'unassigned' } });
  const response = await POST(request());
  expect(response.status).toBe(401); expect(response.cookies.get('leftovers_session')).toBeUndefined();
});
it('rejects cross-origin renewal before authenticating', async () => {
  expect((await POST(request('https://untrusted.example.org'))).status).toBe(403);
  expect(signIn).not.toHaveBeenCalled();
});
