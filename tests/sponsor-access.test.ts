import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const state = vi.hoisted(() => ({ token: true, user: true, role: 'admin', consent: true, status: 'Approved for planning', fail: false, writes: [] as { table: string; payload: Record<string, unknown> }[] }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => state.token ? { value: 'fictional-session' } : undefined }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('../lib/supabase', () => ({ db: () => ({
  auth: { getUser: async () => ({ data: { user: state.user ? { id: '00000000-0000-4000-8000-000000000001' } : null } }) },
  from: (table: string) => {
    let writing = false;
    const query: Record<string, any> = {
      select: () => writing ? Promise.resolve({ data: state.fail ? null : [{ id: '00000000-0000-4000-8000-000000000901' }], error: state.fail ? Error('Private backend detail') : null }) : query,
      eq: () => query,
      single: async () => ({ data: table === 'profiles' ? { role: state.role } : { id: '00000000-0000-4000-8000-000000000101', kind: 'sponsor', organization: 'Fictional Approved Organization', sponsor_website: 'https://business.example.org', support_type: 'Transport', recognition_consent: state.consent, status: state.status, email: 'private@example.org' }, error: null }),
      upsert: (payload: Record<string, unknown>) => { writing = true; state.writes.push({ table, payload }); return query; },
      update: (payload: Record<string, unknown>) => { writing = true; state.writes.push({ table, payload }); return query; },
    }; return query;
  },
}) }));
import { POST } from '../app/api/sponsors/route';
import { revalidatePath } from 'next/cache';
const publish = () => ({ action: 'publish', interest_id: '00000000-0000-4000-8000-000000000101', public_description: 'Agreed fictional support for pilot planning.', confirmed: true });
function request(data: unknown, origin = 'http://localhost:3000') { return new NextRequest('http://localhost:3000/api/sponsors', { method: 'POST', headers: { origin }, body: JSON.stringify(data) }); }
beforeEach(() => { Object.assign(state, { token: true, user: true, role: 'admin', consent: true, status: 'Approved for planning', fail: false, writes: [] }); vi.clearAllMocks(); vi.stubEnv('APP_ORIGIN', 'http://localhost:3000'); vi.stubEnv('DATA_MODE','supabase'); });
afterEach(() => vi.unstubAllEnvs());
it('denies anonymous publication and expired sessions', async () => {
  state.token=false;expect((await POST(request(publish()))).status).toBe(401);
  state.token=true;state.user=false;expect((await POST(request(publish()))).status).toBe(401);expect(state.writes).toHaveLength(0);
});
it('denies cross-origin publication', async () => { expect((await POST(request(publish(),'https://other.example'))).status).toBe(403);expect(state.writes).toHaveLength(0); });
it('keeps publication restricted to administrators', async () => {
  for(const role of ['analyst','coordinator']){state.role=role;expect((await POST(request(publish()))).status).toBe(403);}expect(state.writes).toHaveLength(0);
});
it('requires explicit source recognition consent and prior review', async () => {
  state.consent=false;expect((await POST(request(publish()))).status).toBe(400);
  state.consent=true;state.status='Interest received';expect((await POST(request(publish()))).status).toBe(400);expect(state.writes).toHaveLength(0);
});
it('requires an administrator to confirm the agreement', async () => { expect((await POST(request({...publish(),confirmed:false}))).status).toBe(400);expect(state.writes).toHaveLength(0); });
it('publishes only organization fields and revalidates both public pages', async () => {
  const response=await POST(request(publish()));expect(response.status).toBe(200);
  expect(state.writes[0].table).toBe('sponsors');expect(state.writes[0].payload.public_name).toBe('Fictional Approved Organization');
  expect(state.writes[0].payload).not.toHaveProperty('email');expect(state.writes[0].payload).not.toHaveProperty('name');
  expect(revalidatePath).toHaveBeenCalledWith('/');expect(revalidatePath).toHaveBeenCalledWith('/sponsors');
});
it('allows an administrator to remove a public acknowledgment', async () => {
  expect((await POST(request({action:'unpublish',id:'00000000-0000-4000-8000-000000000901'}))).status).toBe(200);
  expect(state.writes[0].payload).toEqual({published:false});
});
it('does not claim success or reveal backend details when persistence fails', async () => {
  state.fail=true;const response=await POST(request(publish()));expect(response.status).toBe(503);expect(JSON.stringify(await response.json())).not.toContain('Private backend detail');
});

it('blocks stale authenticated sessions from publishing while in preview mode', async () => {
  vi.stubEnv('DATA_MODE','preview');expect((await POST(request(publish()))).status).toBe(503);expect(state.writes).toHaveLength(0);
});
