import { z } from 'zod';

export const interestKinds = ['donor', 'survey', 'pickup', 'contact', 'sponsor'] as const;
export type InterestKind = typeof interestKinds[number];
export const supportTypes = ['Funding', 'Transport', 'Storage and food safety', 'Professional services', 'Community connections', 'Not sure yet'] as const;

export const interestSchema = z.object({
  kind: z.enum(interestKinds),
  organization: z.string().trim().max(160).default(''),
  name: z.string().trim().min(2, 'Enter your name.').max(100),
  email: z.email('Enter a valid email address.').max(254),
  phone: z.string().trim().max(30).regex(/^[+()\d\s.-]*$/, 'Enter a valid phone number.').optional().default(''),
  zip: z.string().trim().max(5, 'Enter a five-digit ZIP code.').default(''),
  category: z.enum(['Produce', 'Prepared meals', 'Bakery', 'Packaged goods', 'Mixed', 'Not applicable'], { error: 'Choose the food category that fits best.' }),
  pounds: z.coerce.number().min(0, 'Weight cannot be negative.').max(100000, 'Enter 100,000 pounds or less.'),
  frequency: z.enum(['One time', 'Weekly', 'Monthly', 'Unsure'], { error: 'Choose how often surplus is available.' }),
  notes: z.string().trim().max(2000, 'Keep your message under 2,000 characters.'),
  topic: z.enum(['general', 'partner', 'privacy']).optional().default('general'),
  support_type: z.enum(supportTypes).optional().default('Not sure yet'),
  sponsor_website: z.string().trim().max(300).optional().default('').refine(value => {
    if (!value) return true;
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
    catch { return false; }
  }, 'Use a full HTTPS website address, or leave this blank.'),
  recognition_consent: z.boolean().optional().default(false),
  turnstileToken: z.string().max(2048).optional().default(''),
  consent: z.literal(true, { error: 'Please agree to be contacted before submitting.' }),
  website: z.string().max(0, 'Unable to accept this submission.'),
  startedAt: z.number().int().positive(),
}).superRefine((data, ctx) => {
  const conversation = data.kind === 'contact' || data.kind === 'sponsor';
  if (data.kind !== 'contact' && data.organization.length < 2) {
    ctx.addIssue({ code: 'custom', path: ['organization'], message: 'Enter your organization or household name.' });
  } else if (data.organization.length === 1) {
    ctx.addIssue({ code: 'custom', path: ['organization'], message: 'Use at least two characters for the organization name.' });
  }
  if (!conversation && !/^85\d{3}$/.test(data.zip)) {
    ctx.addIssue({ code: 'custom', path: ['zip'], message: 'Enter a Phoenix-area ZIP code beginning with 85.' });
  } else if (conversation && data.zip && !/^\d{5}$/.test(data.zip)) {
    ctx.addIssue({ code: 'custom', path: ['zip'], message: 'Enter a five-digit ZIP code, or leave this blank.' });
  }
  if (data.kind === 'survey' && data.pounds <= 0) {
    ctx.addIssue({ code: 'custom', path: ['pounds'], message: 'Enter your estimated surplus weight in pounds.' });
  }
  if (!conversation && data.category === 'Not applicable') {
    ctx.addIssue({ code: 'custom', path: ['category'], message: 'Choose the food category that fits best.' });
  }
  if (conversation && data.notes.length < 10) {
    ctx.addIssue({ code: 'custom', path: ['notes'], message: 'Tell us a little more in at least 10 characters.' });
  }
});

export function timingValid(startedAt: number, now = Date.now()) {
  return now - startedAt >= 2500 && now - startedAt < 86400000;
}
