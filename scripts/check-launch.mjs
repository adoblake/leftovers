import { createClient } from '@supabase/supabase-js';

const required = ['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY'];
const missing = required.filter(name => !process.env[name]);
if (process.env.DATA_MODE !== 'supabase') missing.push('DATA_MODE=supabase');
try { const url = new URL(process.env.APP_ORIGIN || ''); if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) missing.push('APP_ORIGIN: exact HTTPS origin'); }
catch { missing.push('APP_ORIGIN: exact HTTPS origin'); }
if (missing.length) { console.error('Live intake is not ready. Missing or invalid settings: '+missing.join(', ')); process.exit(1); }
let failed = false;
try {
  const server = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const publicClient = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  for (const [name, query] of [
    ['interest schema',server.from('interests').select('id,support_type,recognition_consent',{head:true}).limit(0)],
    ['sponsor schema',server.from('sponsors').select('id,published',{head:true}).limit(0)],
    ['safe public directory',publicClient.from('sponsor_directory').select('id,public_name',{head:true}).limit(0)],
  ]) {
    const {error} = await query;
    console.log(name+': '+(error?'not verified':'verified')); if(error)failed=true;
  }
  const {data:admins,error} = await server.from('profiles').select('id').eq('role','admin').limit(1);
  const adminReady=!error&&Boolean(admins?.length);console.log('provisioned administrator: '+(adminReady?'verified':'missing'));if(!adminReady)failed=true;
  const {error:privacyError} = await publicClient.from('interests').select('id').limit(1);
  const privateSafe=privacyError?.code==='42501';console.log('anonymous contact isolation: '+(privateSafe?'anonymous table access denied':'FAILED'));if(!privateSafe)failed=true;
} catch { console.error('Database readiness could not be verified. Check secure configuration and allowed network destinations.');failed=true; }
if(failed)process.exit(1);
console.log('Read-only live configuration checks passed. Deployed HTTPS form, Turnstile, account-role, and free-plan checks still require verification.');
