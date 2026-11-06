import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { verifyInterestChallenge } from '../lib/turnstile';
beforeEach(() => { vi.stubEnv('DATA_MODE','supabase'); vi.stubEnv('NODE_ENV','production'); vi.stubEnv('TURNSTILE_SECRET_KEY','fictional-test-secret'); vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY','fictional-site-key'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it('accepts a server-verified token only for the expected hostname and action', async () => {
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'pilot.example.org',action:'interest'}),{status:200})));
  expect(await verifyInterestChallenge('fictional-token','pilot.example.org')).toEqual({ok:true});
});
it('rejects tokens from another website or action', async () => {
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'other.example.org',action:'interest'}),{status:200})));
  expect((await verifyInterestChallenge('fictional-token','pilot.example.org')).ok).toBe(false);
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'pilot.example.org',action:'login'}),{status:200})));
  expect((await verifyInterestChallenge('fictional-token','pilot.example.org')).ok).toBe(false);
});
it('fails closed for expired or rejected tokens', async () => {
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:false,'error-codes':['timeout-or-duplicate']}),{status:200})));
  expect(await verifyInterestChallenge('fictional-token','pilot.example.org')).toEqual({ok:false,reason:'invalid'});
});
it('does not contact the verification service for a missing token', async () => {
  const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
  expect(await verifyInterestChallenge('','pilot.example.org')).toEqual({ok:false,reason:'missing'}); expect(fetcher).not.toHaveBeenCalled();
});
it('does not accept live submissions when protection is unconfigured or unavailable', async () => {
  vi.stubEnv('TURNSTILE_SECRET_KEY','');expect(await verifyInterestChallenge('token','pilot.example.org')).toEqual({ok:false,reason:'configuration'});
  vi.stubEnv('TURNSTILE_SECRET_KEY','fictional-test-secret');vi.stubGlobal('fetch',vi.fn(async()=>{throw Error('Network unavailable')}));
  expect(await verifyInterestChallenge('token','pilot.example.org')).toEqual({ok:false,reason:'unavailable'});
});
it('does not require an external service for fictional preview trials', async () => {
  vi.stubEnv('DATA_MODE','preview');const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
  expect(await verifyInterestChallenge('','pilot.example.org')).toEqual({ok:true});expect(fetcher).not.toHaveBeenCalled();
});
