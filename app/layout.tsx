import type { Metadata } from 'next';
import './globals.css';
import { getDataMode } from '@/lib/runtime-config';
import {Header,Footer} from '@/components/Header';
export const metadata:Metadata={title:{default:'LEFTOVERS — Finding Value Everywhere',template:'%s | LEFTOVERS'},description:'Help shape a Phoenix food recovery pilot. Connect surplus food with community possibility. Expressions of interest pending approval.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Header preview={getDataMode() === 'preview'}/>{children}<Footer/></body></html>}
