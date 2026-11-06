import { isAllowedOrigin } from '@/lib/runtime-config';
import {NextRequest,NextResponse} from 'next/server';
export async function POST(req:NextRequest){if(!isAllowedOrigin(req.headers.get('origin')))return new NextResponse(null,{status:403});const res=NextResponse.redirect(new URL('/dashboard',req.url),303);res.cookies.delete('leftovers_session');return res;}
