'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { ArrowLeft, CheckCircle, Smartphone } from 'lucide-react';
import { formatToKsh } from '@/app/lib/currency';

interface Item { id: string; cakeName: string; quantity: number; price: number; image: string }
interface Quote { items: Item[]; subtotal: number; deliveryFee: number; total: number }
interface PaymentResult { status: string; amount: number; mpesaReceiptNumber: string | null; resultDesc?: string }
export default function PaymentContent() {
  const { data: session, status: authStatus } = useSession();
  const [method, setMethod] = useState('delivery');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [receipt, setReceipt] = useState<PaymentResult | null>(null);
  const [paidQuote, setPaidQuote] = useState<Quote | null>(null);
  const [pollExpired, setPollExpired] = useState(false);
  const { data: quote, error: quoteError, isLoading, mutate } = useSWR<Quote>(session?.user && !pendingId && !receipt ? '/api/checkout?deliveryMethod=' + method : null, async (url: string) => { const res = await fetch(url); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Unable to load checkout.'); return data; });
  useEffect(() => {
    if (!pendingId) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const started = Date.now();
    const poll = async () => {
      try {
        const res = await fetch('/api/check-payment?paymentId=' + pendingId, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.status === 'completed') { setReceipt(data); setPendingId(''); setBusy(false); window.dispatchEvent(new Event('cartUpdated')); return; }
        if (res.ok && ['failed', 'cancelled'].includes(data.status)) { setError(data.resultDesc || 'Payment was not completed. You can try again.'); setPendingId(''); setBusy(false); return; }
      } catch { /* Keep checking during transient network failures. */ }
      if (cancelled) return;
      if (Date.now() - started > 120000) { setPollExpired(true); setBusy(false); return; }
      timeout = setTimeout(poll, 3000);
    };
    timeout = setTimeout(poll, 2000);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [pendingId]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quote) return;
    setBusy(true); setError(''); setPollExpired(false);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch('/api/mpesa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: form.get('phone'), customerName: form.get('name'), deliveryAddress: form.get('address'), deliveryMethod: method, deliveryDate: form.get('date'), orderNotes: form.get('notes'), expectedAmount: quote.total }) });
      const data = await res.json();
      if (!res.ok) { if (data.paymentId) { setPaidQuote(quote); setPendingId(data.paymentId); } else setBusy(false); setError(data.error || 'Could not start payment.'); void mutate(); return; }
      setPaidQuote(data.quote); setPendingId(data.paymentId);
    } catch { setError('The connection was interrupted. Check My orders before trying again.'); setBusy(false); }
  };
  const shownQuote = paidQuote && (pendingId || receipt) ? paidQuote : quote;
  const header = <header className="bakery-header"><div className="bakery-container header-inner"><Link href="/" className="wordmark">Japhe&apos;s<span>CAKES & BAKING SCHOOL</span></Link><Link href="/" className="text-link"><ArrowLeft size={15} /> Continue shopping</Link></div></header>;
  const items = (value?: Quote) => value?.items.map(item => <div key={item.id} className="checkout-item"><Image src={item.image} alt={item.cakeName} width={65} height={65} className="object-cover aspect-square" unoptimized={item.image.startsWith('/uploads/')} /><div className="flex-1"><h3>{item.cakeName}</h3><p>Quantity: {item.quantity}</p></div><span>{formatToKsh(item.price * item.quantity)}</span></div>);
  if (receipt) return <>{header}<main className="checkout-panel checkout-success"><CheckCircle className="text-emerald-700 mb-5" size={35} /><p className="eyebrow">THANK YOU FOR YOUR ORDER</p><h1>Payment received.</h1><p>Your order details are saved. You can view them any time in My orders.</p>{items(paidQuote || undefined)}<div className="checkout-total final"><span>Amount paid</span><span>{formatToKsh(receipt.amount)}</span></div><p className="mt-5 text-sm">M-Pesa reference: {receipt.mpesaReceiptNumber || 'Awaiting receipt reference'}</p><div className="flex flex-wrap gap-3 mt-7 no-print"><Link className="bakery-button" href="/orders">View my orders</Link><button className="bakery-button secondary" onClick={() => window.print()}>Print receipt</button></div></main></>;
  return <>{header}<main className="bakery-container"><div className="catalog-heading"><p className="eyebrow">ONE STEP CLOSER</p><h1>A lovely choice.</h1><p>Review your order and leave the details with us.</p></div>
    {authStatus === 'loading' ? <p className="empty-state" role="status">Loading your account…</p> : !session?.user ? <div className="empty-state"><h2>Sign in to finish your order.</h2><p>Your bag will be waiting for you.</p><Link href="/login?callbackUrl=/payment" className="bakery-button">Sign in</Link></div> :
    <div className="checkout-grid"><section className="checkout-panel">
      {error && <div role="alert" className="notice">{error}</div>}
      {pendingId ? <div role="status"><Smartphone className="text-[#713c46] mb-5" size={32} /><h2>{pollExpired ? 'Still waiting for confirmation.' : 'Check your phone.'}</h2><p className="text-sm text-stone-600 leading-7">{pollExpired ? 'Your payment may still complete. Check My orders before starting another payment.' : 'Enter your M-Pesa PIN on the prompt sent to your phone. This page will update when payment is confirmed.'}</p><Link href="/orders" className="bakery-button secondary mt-6">View my orders</Link></div> :
      <form onSubmit={submit}><h2>1. Your details</h2><label>Your name<input name="name" autoComplete="name" required maxLength={150} defaultValue={session.user.name || ''} /></label><label>Delivery or pickup<select value={method} onChange={e => setMethod(e.target.value)}><option value="delivery">Delivery</option><option value="pickup">Store pickup</option></select></label>{method === 'delivery' && <label>Delivery address<textarea name="address" autoComplete="street-address" required maxLength={500} rows={3} placeholder="Area, street, building, and any directions" /></label>}<label>Preferred date<input type="date" name="date" min={new Date().toLocaleDateString('en-CA')} /></label><label>A note for the bakery <span className="text-stone-400">(optional)</span><textarea name="notes" rows={2} maxLength={1000} placeholder="Anything you would like us to know" /></label><h2 className="mt-8">2. Pay with M-Pesa</h2><label>M-Pesa phone number<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0712 345 678" /></label><p className="text-xs text-stone-500 leading-6 mb-5">We will send a payment prompt to your phone. Enter your PIN on your phone only.</p><button className="bakery-button" disabled={busy || isLoading || !quote || !!quoteError}>{busy ? 'Starting payment…' : quote ? 'Pay ' + formatToKsh(quote.total) : 'Preparing your order…'}</button></form>}
    </section><aside className="checkout-panel checkout-summary"><h2>Your order</h2>{quoteError && !pendingId ? <div role="alert"><p className="notice">{quoteError.message}</p><button className="text-link" onClick={() => mutate()}>Refresh order</button></div> : isLoading ? <p role="status">Updating your order…</p> : <>{items(shownQuote)}<div className="checkout-total"><span>Subtotal</span><span>{formatToKsh(shownQuote?.subtotal || 0)}</span></div><div className="checkout-total"><span>Delivery</span><span>{shownQuote?.deliveryFee ? formatToKsh(shownQuote.deliveryFee) : 'No charge'}</span></div><div className="checkout-total final"><span>Total</span><span>{formatToKsh(shownQuote?.total || 0)}</span></div><p className="text-xs text-stone-500 mt-5 leading-6">Delivery is KSh 350, or free for orders of KSh 5,000 and above. Pickup has no delivery charge. The team will confirm arrangements for your preferred date.</p></>}</aside></div>}
  </main></>;
}

