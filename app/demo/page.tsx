import {Dashboard} from '@/components/Dashboard';
import {demoDonors,demoPickups} from '@/lib/demo';
export default function Page(){return <Dashboard demo interests={demoDonors.map(d=>({...d,kind:'donor'}))} pickups={demoPickups} partners={[{organization:'Example Community Pantry',status:'Demo — prospective',zip:'85004'}]} costs={[{category:'Demo planning expenses',amount:120}]}/>}
