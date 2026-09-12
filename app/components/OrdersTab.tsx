'use client';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { formatToKsh } from '@/app/lib/currency';
interface Order { id: string; status: string; total: number; mpesaReceiptNumber?: string; createdAt: string; items: { name: string; quantity: number; price: number }[]; deliveryDetails?: { deliveryMethod: string; deliveryAddress: string; deliveryDate: string } }
export default function OrdersTab({ userId }: { userId: string }) {
  const { data: orders, error, isLoading, mutate } = useSWR<Order[]>('/api/orders/user/' + userId, async (url: string) => { const res = await fetch(url); if (!res.ok) throw new Error('Unable to load orders'); return res.json(); });
  const [busy, setBusy] = useState(false);
  const refresh = async () => { setBusy(true); try { await Promise.all((orders || []).filter(o => o.status === 'pending').map(o => fetch('/api/check-payment?paymentId=' + o.id))); await mutate(); } finally { setBusy(false); } };
  return <section className="bakery-container bakery-section"><div className="section-heading"><div><p className="eyebrow">YOUR JAPHEE ACCOUNT</p><h1 className="font-serif text-4xl">My orders</h1></div><button className="bakery-button secondary" onClick={refresh} disabled={busy}>{busy ? 'Checking…' : 'Refresh payment status'}</button></div>
    {error ? <div className="empty-state" role="alert"><h2>We could not load your orders.</h2><p>Try refreshing your payment status.</p></div> : isLoading ? <p role="status">Loading orders…</p> : !orders?.length ? <div className="empty-state"><h2>Your first occasion awaits.</h2><p>Once you check out, your order details will appear here.</p><Link href="/#cakes" className="bakery-button">Explore cakes</Link></div> :
    <div className="space-y-6">{orders.map(order => <article key={order.id} className="checkout-panel"><div className="flex flex-wrap justify-between gap-4"><div><p className="eyebrow mb-2">ORDER {order.id.slice(-8).toUpperCase()}</p><p className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><span className={order.status === 'completed' ? 'text-emerald-800 text-sm' : 'text-stone-600 text-sm'}>{order.status === 'completed' ? 'Payment confirmed' : order.status === 'pending' ? 'Awaiting payment confirmation' : 'Payment ' + order.status}</span></div>
    {order.items.map((item, i) => <div key={i} className="checkout-item justify-between"><span>{item.name} × {item.quantity}</span><span>{formatToKsh(item.price * item.quantity)}</span></div>)}<div className="checkout-total final"><span>Order total</span><span>{formatToKsh(order.total)}</span></div>{order.mpesaReceiptNumber && <p className="text-xs text-stone-500 mt-4">M-Pesa reference: {order.mpesaReceiptNumber}</p>}{order.deliveryDetails && <p className="text-sm text-stone-600 mt-5">{order.deliveryDetails.deliveryMethod === 'pickup' ? 'Store pickup' : 'Delivery: ' + order.deliveryDetails.deliveryAddress}{order.deliveryDetails.deliveryDate && ' · Preferred date: ' + order.deliveryDetails.deliveryDate}</p>}<p className="text-xs text-stone-500 mt-4">Payment status is shown above. Delivery and pickup arrangements are confirmed separately by the bakery.</p></article>)}</div>}
  </section>;
}

