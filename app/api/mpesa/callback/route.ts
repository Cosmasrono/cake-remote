import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { reconcilePayment } from '@/app/lib/reconcile-payment';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = body?.response || body?.Body?.stkCallback || body;
    const checkout = response?.CheckoutRequestID || body?.reference;
    const external = response?.ExternalReference || body?.user_reference || body?.external_reference;
    const conditions = [];
    if (typeof checkout === 'string' && checkout.length <= 200) conditions.push({ checkoutRequestId: checkout });
    if (typeof external === 'string' && /^[a-f\d]{24}$/i.test(external)) conditions.push({ id: external });
    if (!conditions.length) return NextResponse.json({ error: 'Invalid callback reference.' }, { status: 400 });
    const payment = await prisma.payment.findFirst({ where: { OR: conditions } });
    if (!payment) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });
    // Callback contents are only a notification. Status and amount come from
    // the authenticated provider API using our stored transaction reference.
    const verified = await reconcilePayment(payment.id);
    if (verified.status === 'PENDING') return NextResponse.json({ error: 'Verification is pending.' }, { status: 503 });
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch { return NextResponse.json({ error: 'Unable to verify callback.' }, { status: 503 }); }
}

