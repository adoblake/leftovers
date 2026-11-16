import type { Metadata } from 'next';
import { FormPage } from '@/components/FormPage';
import type { ContactTopic } from '@/lib/validation';

export const metadata: Metadata = { title: 'Contact' };

const copy: Record<ContactTopic, { title: string; description: string }> = {
  general: { title: 'Talk to us straight.', description: 'Questions, ideas or local knowledge are all welcome. No organization or location is needed to send a message.' },
  partner: { title: 'Bring what you do best.', description: 'Clinics, shelters, recovery programs and community groups: tell us what you offer and who you serve. Partnerships are proposed and subject to review.' },
  privacy: { title: 'Your information. Your call.', description: 'Ask about your submission, request a correction or request deletion. Include only what we need to find your earlier response.' },
  crew: { title: 'Ready to work?', description: 'Join the Day Crew interest list. The crew is not hiring yet. Tell us how to reach you and we’ll get in touch when shifts open in Phoenix.' },
  employer: { title: 'Got work that needs doing?', description: 'Cleanup, catering prep, landscaping, warehouse help. Tell us about work a trained, supervised crew could take on. Contracts are planned, not yet available.' },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string | string[] }> }) {
  const { topic: requested } = await searchParams;
  const topic: ContactTopic = typeof requested === 'string' && requested in copy ? requested as ContactTopic : 'general';
  return <FormPage kind="contact" topic={topic} title={copy[topic].title} description={copy[topic].description} />;
}
