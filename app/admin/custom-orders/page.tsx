// app/admin/custom-orders/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import { CUSTOM_ORDER_STATUSES, STATUS_LABELS, orderReference } from '@/app/lib/custom-orders';
import { adminReplyMessage, toWhatsAppNumber, whatsappLink } from '@/app/lib/whatsapp';

const ERRORS: Record<string, string> = {
  missing_enquiry: 'That enquiry could not be identified. Please try again.',
  unknown_status: 'That status is not recognised.',
  update_failed: 'The status could not be updated. Please try again.',
};

export default async function CustomOrdersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) redirect('/login');
  const { error } = await searchParams;
  const orders = await prisma.customOrder.findMany({ orderBy: { createdAt: 'desc' } });
  const open = orders.filter(order => order.status === 'pending').length;

  return <main className="bakery-container bakery-section">
    <div className="section-heading">
      <div>
        <p className="eyebrow">JAPHE&apos;S ADMINISTRATION</p>
        <h1 className="font-serif text-4xl">Custom cake enquiries.</h1>
      </div>
      <Link href="/admin/dashboard" className="bakery-button secondary">Back to dashboard</Link>
    </div>
    <p className="text-sm text-stone-500 mb-8">{orders.length} enquiries in total{open ? `, ${open} awaiting a first reply` : ', all have been picked up'}. Enquiries arrive here from the website form and from WhatsApp.</p>

    {error && <div className="notice" role="alert">{ERRORS[error] || 'Something went wrong. Please try again.'}</div>}

    {!orders.length ? <div className="empty-state">
      <h2>No enquiries just yet.</h2>
      <p>Requests from the custom cake form and from WhatsApp will appear here.</p>
    </div> : <div className="grid gap-5">
      {orders.map(order => {
        const reference = orderReference(order.id);
        const replyLink = whatsappLink(adminReplyMessage(order.name, reference), toWhatsAppNumber(order.phone));
        return <article key={order.id} className="checkout-panel">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h2 className="font-serif text-2xl">{order.name}</h2>
              <p className="text-sm text-stone-600 mt-1">{order.phone} · {reference}</p>
              <p className="text-xs text-stone-500 mt-1">Received {new Date(order.createdAt).toLocaleString('en-KE')} · {order.source === 'whatsapp' ? 'WhatsApp enquiry' : 'Website form'}</p>
            </div>
            <span className="enquiry-status" data-status={order.status}>{STATUS_LABELS[order.status] || order.status}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <dl className="enquiry-details">
              <div><dt>Occasion</dt><dd>{order.occasion || 'Not specified'}</dd></div>
              <div><dt>Preferred date</dt><dd>{order.date || 'Not specified'}</dd></div>
              <div><dt>Flavour</dt><dd>{order.flavor || 'Open to suggestions'}</dd></div>
              <div><dt>Size / tiers</dt><dd>{order.size || 'Not specified'}</dd></div>
              {order.message && <div><dt>Message on cake</dt><dd>{order.message}</dd></div>}
              {order.inspirationLink && <div><dt>Inspiration</dt><dd><a className="text-link" href={order.inspirationLink} target="_blank" rel="noopener noreferrer">Open the customer&apos;s link</a></dd></div>}
            </dl>
            {order.image && <div className="relative h-56 rounded overflow-hidden bg-stone-100">
              <Image src={order.image} alt={`Inspiration shared by ${order.name}`} fill sizes="(max-width: 760px) 100vw, 40vw" className="object-cover" unoptimized />
            </div>}
          </div>

          <div className="enquiry-actions">
            <a className="whatsapp-button" href={replyLink} target="_blank" rel="noopener noreferrer">Reply on WhatsApp</a>
            {CUSTOM_ORDER_STATUSES.filter(status => status !== order.status).map(status =>
              <form key={status} action="/api/admin/custom-orders/status" method="POST">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={status} />
                <button className="text-link">Mark {STATUS_LABELS[status].toLowerCase()}</button>
              </form>)}
          </div>
        </article>;
      })}
    </div>}
  </main>;
}
