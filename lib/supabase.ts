import { createClient } from '@supabase/supabase-js';
export function db(token?: string, service=false){
 const url=process.env.SUPABASE_URL; const key=service?process.env.SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_ANON_KEY;
 if(!url||!key)throw new Error('Supabase configuration missing');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:token?{headers:{Authorization:`Bearer ${token}`}}:undefined});
}
