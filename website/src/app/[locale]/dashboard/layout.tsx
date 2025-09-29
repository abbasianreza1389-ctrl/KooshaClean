import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export default function DashboardLayout({children, params:{locale}}:{children:React.ReactNode, params:{locale:string}}){
  const token = cookies().get('access')?.value;
  if(!token) redirect(`/${locale}/login`);
  return <section className="container mx-auto py-8">{children}</section>;
}
