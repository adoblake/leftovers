// Local-only accessibility fixture. Never used by the application or a real database.
import { createServer } from 'node:http';
const userId = '00000000-0000-4000-8000-000000000001';
const stamp = '2026-11-14T12:00:00Z';
function token(role = 'admin') {
  const now = Math.floor(Date.now() / 1000);
  return `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, role: 'authenticated', fixture_role: role, iat: now, exp: now + 3600 })).toString('base64url')}.fictional-signature`;
}
function claims(req) {
  try { return JSON.parse(Buffer.from(String(req.headers.authorization).split('.')[1], 'base64url').toString('utf8')); }
  catch { return {}; }
}
function user(role) { return { id: userId, aud: 'authenticated', role: 'authenticated', email: `${role}@example.org`, email_confirmed_at: stamp, created_at: stamp, updated_at: stamp, app_metadata: { provider: 'email' }, user_metadata: {} }; }
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:3152');
  const role = claims(req).fixture_role || 'admin';
  const send = (value, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
  if (url.pathname === '/health') return send({ fixture: true });
  if (url.pathname === '/auth/v1/user') return send(user(role));
  if (url.pathname === '/auth/v1/token') {
    let body = ''; for await (const chunk of req) body += chunk;
    const data = JSON.parse(body || '{}');
    if (data.password !== 'fictional-accessibility-password') return send({ code: 'invalid_credentials', message: 'Invalid credentials.' }, 400);
    const nextRole = ['admin', 'coordinator', 'analyst'].find(r => data.email === `${r}@example.org`);
    if (!nextRole) return send({ message: 'Unknown fixture user.' }, 400);
    return send({ access_token: token(nextRole), token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'fictional-refresh', user: user(nextRole) });
  }
  if (url.pathname === '/rest/v1/profiles') return send({ role });
  if (url.pathname === '/rest/v1/interests') return send(role === 'analyst' ? [] : [
    { id: '00000000-0000-4000-8000-000000000101', organization: 'Fictional Food Donor', kind: 'donor', category: 'Produce', zip: '85004', status: 'Under review', name: 'Demo Person', email: 'demo@example.org', phone: '', pounds: 25, frequency: 'Weekly', notes: 'Fictional accessibility test response.' },
    { id: '00000000-0000-4000-8000-000000000102', organization: 'Fictional Sponsor', kind: 'sponsor', category: 'Not applicable', zip: null, status: 'Approved for planning', name: 'Demo Contact', email: 'sponsor@example.org', phone: '', support_type: 'Transport', recognition_consent: true, notes: 'Fictional recognition permission for browser tests only.' },
  ]);
  if (url.pathname === '/rest/v1/recipient_partners') return send([{ id: '00000000-0000-4000-8000-000000000301', organization: 'Fictional Community Pantry', status: 'Prospective', zip: '85004' }]);
  if (url.pathname === '/rest/v1/pickups') return send([{ id: '00000000-0000-4000-8000-000000000201', category: 'Produce', estimated_pounds: 25, actual_pounds: null, status: 'Under review' }]);
  if (url.pathname === '/rest/v1/operating_costs') return send([{ category: 'Fictional planning cost', amount: 10 }]);
  if (url.pathname === '/rest/v1/sponsors') return send([{ id: '00000000-0000-4000-8000-000000000401', public_name: 'Fictional Published Sponsor', published: true }]);
  return send({ message: 'No fixture for this request.' }, 404);
});
server.listen(3152, '127.0.0.1', () => console.log('Local accessibility fixture ready. All records are fictional.'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
