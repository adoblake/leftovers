import { isAllowedOrigin, getDataMode } from '@/lib/runtime-config';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/supabase';
const attempts=new Map<string,{count:number,until:number}>();
export async function POST(req:NextRequest){
 if(!isAllowedOrigin(req.headers.get('origin')))return NextResponse.json({message:'Origin not allowed.'},{status:403});
 if(getDataMode()!=='supabase')return NextResponse.json({message:'Staff sign-in requires a configured pilot workspace.'},{status:503});
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'local';const previous=attempts.get(ip);if(previous&&previous.until>Date.now()&&previous.count>=8)return NextResponse.json({message:'Try again in 15 minutes.'},{status:429});attempts.set(ip,{count:previous&&previous.until>Date.now()?previous.count+1:1,until:Date.now()+900000});
 try{const {email,password}=await req.json();if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>256)throw Error();const client=db();const {data,error}=await client.auth.signInWithPassword({email,password});if(error||!data.session)throw Error();const {data:profile}=await client.from('profiles').select('role').eq('id',data.user.id).single();if(!profile||!['admin','coordinator','analyst'].includes(profile.role))throw Error();const res=NextResponse.json({ok:true});res.cookies.set('leftovers_session',data.session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:Math.min(data.session.expires_in,3600)});return res;}catch{return NextResponse.json({message:'Unable to sign in. Check your account or contact your administrator.'},{status:401});}
}
