import { getDataMode, isAllowedOrigin } from '@/lib/runtime-config';
import {NextRequest,NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {z} from 'zod';
import {db} from '@/lib/supabase';
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('review'),id:z.uuid(),status:z.enum(['Interest received','Under review','Approved for planning','Declined'])}),
 z.object({action:z.literal('partner'),organization:z.string().trim().min(2).max(160),zip:z.string().regex(/^85\d{3}$/)}),
 z.object({action:z.literal('cost'),category:z.string().trim().min(2).max(100),amount:z.coerce.number().min(0).max(1000000),incurred_on:z.iso.date()}),
 z.object({action:z.literal('pickup'),interest_id:z.uuid(),category:z.enum(['Produce','Prepared meals','Bakery','Packaged goods','Mixed']),estimated_pounds:z.coerce.number().min(0).max(100000)}),
 z.object({action:z.literal('status'),id:z.uuid(),status:z.enum(['Interest received','Under review','Approved for planning','Cancelled'])})
]);
export async function POST(req:NextRequest){
 if(!isAllowedOrigin(req.headers.get('origin')))return NextResponse.json({message:'Origin not allowed.'},{status:403});
 const token=(await cookies()).get('leftovers_session')?.value;if(!token)return NextResponse.json({message:'Sign in required.'},{status:401});
 if(getDataMode()!=='supabase')return NextResponse.json({message:'Private record changes are disabled in demonstration mode.'},{status:503});
 try{const client=db(token);const {data:{user}}=await client.auth.getUser(token);if(!user)return NextResponse.json({message:'Session expired.'},{status:401});const {data:profile}=await client.from('profiles').select('role').eq('id',user.id).single();const input=schema.safeParse(await req.json());if(!input.success)return NextResponse.json({message:'Check the required fields and try again.'},{status:400});const d=input.data;if(!profile||!['admin','coordinator'].includes(profile.role)||(d.action==='cost'&&profile.role!=='admin'))return NextResponse.json({message:'Your role cannot make this change.'},{status:403});
 let result;
 if(d.action==='review')result=await client.from('interests').update({status:d.status}).eq('id',d.id).select('id');
 else if(d.action==='partner')result=await client.from('recipient_partners').insert({organization:d.organization,zip:d.zip}).select('id');
 else if(d.action==='cost')result=await client.from('operating_costs').insert({category:d.category,amount:d.amount,incurred_on:d.incurred_on}).select('id');
 else if(d.action==='pickup'){const {data:source}=await client.from('interests').select('kind').eq('id',d.interest_id).single();if(!source||!['donor','survey','pickup'].includes(source.kind))return NextResponse.json({message:'Choose a food-related interest record.'},{status:400});result=await client.from('pickups').insert({interest_id:d.interest_id,category:d.category,estimated_pounds:d.estimated_pounds}).select('id');}
 else result=await client.from('pickups').update({status:d.status}).eq('id',d.id).select('id');
 if(result.error||!result.data?.length)throw Error();return NextResponse.json({message:'Record saved.'});
 }catch{return NextResponse.json({message:'Unable to save. Check record identifiers and permissions.'},{status:400});}
}
