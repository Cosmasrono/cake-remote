import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getAppSession } from '@/app/lib/auth-options';
import { CUSTOM_ORDER_STATUSES, type CustomOrderStatus } from '@/app/lib/custom-orders';
import { deliveryFee } from '@/app/lib/checkout';
import { FINAL_STAGES, OrderStage, STAGE_LABEL, nextStage, stageOf } from '@/app/lib/order-stages';

const STAFF = ['CASHIER', 'ADMIN', 'SUPER_ADMIN'];
/** How far back the till looks for website orders still being worked on. */
const ACTIVE_DAYS = 14;

type StoredItem = { id?: string; cakeName?: string; name?: string; price?: number; quantity?: number; image?: string };
type StoredOrder = {
  isCourseEnrollment?: boolean;
  items?: StoredItem[];
  subtotal?: number;
  deliveryFee?: number;
  deliveryDetails?: {
    customerName?: string; phoneNumber?: string; deliveryAddress?: string; deliveryMethod?: string;
    deliveryDate?: string; orderNotes?: string; paymentType?: string;
  };
};

/** Matches the order only if nobody moved it meanwhile (older orders have no stage saved at all). */
function stillAt(fulfilment: string | null) {
  return fulfilment ? { fulfilment } : { OR: [{ fulfilment: null }, { fulfilment: { isSet: false } }] };
}

export async function GET() {
  const session = await getAppSession();
  if (!session?.user || !STAFF.includes(session.user.role)) {
    return NextResponse.json({ error: 'Please sign in to the till.' }, { status: 401 });
  }

  try {
    // Website orders the bakery still has to act on: cash orders not yet paid,
    // and paid orders not yet delivered or collected. Course fees are not orders.
    const since = new Date(Date.now() - ACTIVE_DAYS * 24 * 60 * 60 * 1000);
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: since },
        OR: [
          { status: 'PENDING', merchantRequestId: 'PAY_ON_DELIVERY' },
          { status: 'COMPLETED' },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    const webOrders = payments
      .filter((p) => {
        const data = (p.cartItems as StoredOrder | null) || {};
        return !data.isCourseEnrollment && Array.isArray(data.items) && !FINAL_STAGES.includes(stageOf(p.fulfilment));
      })
      .map((p) => {
        const data = (p.cartItems as StoredOrder | null) || {};
        const details = data.deliveryDetails || {};
        const items = (data.items || []).map((item) => ({
          id: item.id || '',
          productId: item.id || '',
          name: item.cakeName || item.name || 'Bakery item',
          category: 'Website Order',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || '/images/cake1.jpg',
        }));
        if (data.deliveryFee && data.deliveryFee > 0) {
          items.push({ id: `delivery-${p.id}`, productId: 'delivery-fee', name: 'Delivery Fee', category: 'Delivery', price: data.deliveryFee, quantity: 1, image: '' });
        }
        const method = details.deliveryMethod === 'pickup' ? 'pickup' : 'delivery';
        const stage = stageOf(p.fulfilment);
        const paid = p.status === 'COMPLETED';
        return {
          id: p.id,
          source: 'storefront',
          orderType: method,
          customerName: details.customerName || 'Website customer',
          customerPhone: details.phoneNumber || p.phoneNumber || '',
          deliveryAddress: method === 'pickup' ? 'Store pickup' : details.deliveryAddress || '',
          deliveryDate: details.deliveryDate || '',
          orderNotes: details.orderNotes || '',
          paid,
          paymentLabel: paid
            ? p.mpesaReceiptNumber ? `Paid · M-Pesa ${p.mpesaReceiptNumber}` : 'Paid'
            : method === 'pickup' ? 'Cash due on pickup' : 'Cash due on delivery',
          stage,
          stageLabel: STAGE_LABEL[stage],
          next: nextStage(stage, method),
          items,
          subtotal: data.subtotal || p.amount,
          deliveryFee: data.deliveryFee || 0,
          total: p.amount,
          createdAt: p.createdAt,
        };
      });

    const customOrders = await prisma.customOrder.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const BASE_QUOTE = 2500; // starting price; the cashier adjusts it to the agreed quote
    const customCakes = customOrders.map((co) => {
      const delivery = co.deliveryMethod === 'delivery';
      const fee = delivery ? deliveryFee(BASE_QUOTE, 'delivery') : 0;
      const items = [
        {
          id: `custom-cake-${co.id}`,
          productId: `custom-cake-${co.id}`,
          name: `Custom Cake: ${co.flavor || 'Bespoke'} (${co.size || 'Standard'})`,
          category: 'Cakes',
          price: BASE_QUOTE,
          quantity: 1,
          image: co.image || '/images/cake1.jpg',
          notes: co.message || undefined,
        },
        // Typed-price ("custom-") line, so the till accepts it and the cashier can remove it if delivery is free.
        ...(fee ? [{ id: `custom-delivery-${co.id}`, productId: `custom-delivery-${co.id}`, name: 'Delivery Fee', category: 'Custom', price: fee, quantity: 1, image: '', notes: undefined }] : []),
      ];
      return {
        id: co.id,
        source: 'custom_cake',
        orderType: delivery ? 'delivery' : 'pickup',
        customerName: co.name,
        customerPhone: co.phone,
        deliveryAddress: delivery ? co.deliveryAddress || 'Address to confirm' : 'Store pickup',
        deliveryDate: co.date || '',
        orderNotes: `Custom cake — Occasion: ${co.occasion || 'N/A'}, Flavour: ${co.flavor || 'N/A'}, Size: ${co.size || 'N/A'}, Msg: "${co.message || ''}"`,
        paid: false,
        paymentLabel: 'Custom cake quote',
        stage: 'NEW' as OrderStage,
        stageLabel: 'Enquiry',
        next: null,
        items,
        subtotal: BASE_QUOTE,
        deliveryFee: fee,
        total: BASE_QUOTE + fee,
        createdAt: co.createdAt,
      };
    });

    return NextResponse.json({ orders: [...webOrders, ...customCakes] });
  } catch (error) {
    console.error('Error fetching online orders for POS:', error);
    return NextResponse.json({ error: 'Failed to fetch online orders' }, { status: 500 });
  }
}

/** Moves a website order to its next step, or cancels an unpaid one. */
export async function PATCH(request: Request) {
  const session = await getAppSession();
  if (!session?.user || !STAFF.includes(session.user.role)) {
    return NextResponse.json({ error: 'Please sign in to the till.' }, { status: 401 });
  }

  try {
    const { orderId, source, status, stage, cashierNote } = await request.json();
    if (typeof orderId !== 'string' || !/^[a-f\d]{24}$/i.test(orderId)) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }
    const by = session.user.name || session.user.email || 'Cashier';
    const note = typeof cashierNote === 'string' ? cashierNote.trim().slice(0, 300) : '';

    if (source === 'custom_cake') {
      if (!CUSTOM_ORDER_STATUSES.includes(status as CustomOrderStatus)) {
        return NextResponse.json({ error: 'Unknown status' }, { status: 400 });
      }
      await prisma.customOrder.update({ where: { id: orderId }, data: { status } });
      return NextResponse.json({ success: true });
    }

    const order = await prisma.payment.findUnique({ where: { id: orderId } });
    const data = (order?.cartItems as StoredOrder | null) || {};
    if (!order || data.isCourseEnrollment || !Array.isArray(data.items)) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    const current = stageOf(order.fulfilment);
    const log = [...((order.fulfilmentLog as object[] | null) || [])];

    // Cancelling: only a cash order nobody has paid for yet, before it leaves the shop.
    if (stage === 'CANCELLED' || status === 'cancelled') {
      if (order.merchantRequestId !== 'PAY_ON_DELIVERY' || order.status !== 'PENDING' || !['NEW', 'PREPARING'].includes(current)) {
        return NextResponse.json({ error: 'Only unpaid cash orders that have not left the shop can be cancelled.' }, { status: 409 });
      }
      const res = await prisma.payment.updateMany({
        where: { id: orderId, status: 'PENDING', ...stillAt(order.fulfilment) },
        data: {
          status: 'CANCELLED',
          fulfilment: 'CANCELLED',
          fulfilmentLog: [...log, { stage: 'CANCELLED', at: new Date().toISOString(), by, note }],
          resultDesc: `Cancelled at POS by ${by}. ${note}`.trim(),
        },
      });
      if (!res.count) return NextResponse.json({ error: 'This order just changed. Refresh and try again.' }, { status: 409 });
      return NextResponse.json({ success: true });
    }

    const method = data.deliveryDetails?.deliveryMethod === 'pickup' ? 'pickup' : 'delivery';
    const next = nextStage(current, method);
    if (!next || stage !== next) {
      return NextResponse.json({ error: 'This order just changed. Refresh and try again.' }, { status: 409 });
    }
    // Handing over the food closes the order, so it must be paid for by then.
    if ((next === 'DELIVERED' || next === 'COLLECTED') && order.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Take payment first: load the order into the till and check it out (cash or M-Pesa).' },
        { status: 409 },
      );
    }
    const res = await prisma.payment.updateMany({
      where: { id: orderId, ...stillAt(order.fulfilment) },
      data: { fulfilment: next, fulfilmentLog: [...log, { stage: next, at: new Date().toISOString(), by }] },
    });
    if (!res.count) return NextResponse.json({ error: 'This order just changed. Refresh and try again.' }, { status: 409 });
    return NextResponse.json({ success: true, stage: next });
  } catch (error) {
    console.error('Error updating online order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
