import type { Metadata } from 'next';
import { FormPage } from '@/components/FormPage';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Join the Day Crew' };

export default function Page() {
  return <FormPage kind="contact" topic="crew" title="Ready to work? Get on the list." description="The Day Crew will offer paid shifts you can pick up that morning and get paid for that day. It is not hiring yet. Join the list and we’ll reach out when shifts open in Phoenix.">
    <ul className="crew-facts" aria-label="What the Day Crew will offer">
      <li><Icon name="sun" width="26" height="26" /><b>Pick up a shift that morning</b><span>No long application. Show up, check in, get to work.</span></li>
      <li><Icon name="chart" width="26" height="26" /><b>Paid the same day</b><span>At least Arizona minimum wage, paid in money at the end of your shift.</span></li>
      <li><Icon name="leaf" width="26" height="26" /><b>Move up</b><span>Steady crew members can become crew leads or get help into outside jobs.</span></li>
    </ul>
  </FormPage>;
}
