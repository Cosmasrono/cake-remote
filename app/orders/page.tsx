import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAppSession } from '@/app/lib/auth-options';
import OrdersTab from '@/app/components/OrdersTab';
export default async function OrdersPage() {
  const session = await getAppSession();
  if (!session?.user?.id) redirect('/login?callbackUrl=/orders');
  return <><header className="bakery-header"><div className="bakery-container header-inner"><Link href="/" className="wordmark">Japhe&apos;s<span>CAKES & BAKING SCHOOL</span></Link><Link href="/#cakes" className="text-link">Continue shopping →</Link></div></header><main><OrdersTab userId={session.user.id} /></main></>;
}

