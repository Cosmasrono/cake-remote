import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getAppSession } from '@/app/lib/auth-options';
import { formatToKsh } from '@/app/lib/currency';
export default async function AdminOrdersPage() {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN','SUPER_ADMIN'].includes(session.user.role)) redirect('/login');
  const payments = await prisma.payment.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } });
  return <main className="bakery-container bakery-section"><Link href="/admin/dashboard" className="text-link mb-8">← Dashboard</Link><div className="section-heading"><div><p className="eyebrow">LATEST 100 TRANSACTIONS</p><h1 className="font-serif text-4xl">Orders & payments</h1></div></div><div className="checkout-panel overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Customer','Date','Phone','Total','Payment status','Receipt'].map(h => <th key={h} className="p-3 border-b border-stone-200">{h}</th>)}</tr></thead><tbody>{payments.map(p => <tr key={p.id}>{[p.user.name,p.createdAt.toLocaleDateString('en-KE'),p.phoneNumber,formatToKsh(p.amount),p.status.toLowerCase(),p.mpesaReceiptNumber || '—'].map((value,i) => <td key={i} className="p-3 border-b border-stone-100">{value}</td>)}</tr>)}</tbody></table>{!payments.length && <p className="py-6 text-sm">No payments to display yet.</p>}</div></main>;
}

