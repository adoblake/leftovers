import type { Metadata } from 'next';
import { FormPage } from '@/components/FormPage';

export const metadata: Metadata = { title: 'Contact' };
export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string | string[] }> }) {
  const { topic: requested } = await searchParams;
  const topic = requested === 'partner' || requested === 'privacy' ? requested : 'general';
  return <FormPage kind="contact" topic={topic}
    title={topic === 'partner' ? 'Let’s find common ground.' : topic === 'privacy' ? 'Your information. Your voice.' : 'Good things start with a conversation.'}
    description={topic === 'partner' ? 'Tell us about your community organization, food needs, and capacity. Recipient partnerships are proposed and subject to review.' : topic === 'privacy' ? 'Ask about your submission, request a correction, or request deletion. Please include only the information needed to identify your earlier response.' : 'Have a question, an idea, or a local perspective? We’d like to hear it. No organization or location is required to send a message.'}
  />;
}
