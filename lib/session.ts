// Display timing only. Supabase still verifies the token and roles on the server.
export function sessionExpiryForDisplay(token: string): number {
  try {
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    if (!Number.isFinite(claims.exp) || !Number.isFinite(claims.iat)) return Date.now();
    return Math.min(claims.exp, claims.iat + 3600) * 1000;
  } catch { return Date.now(); }
}
