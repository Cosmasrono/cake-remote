import { prisma } from './prisma';
import { getPayHeroTransactionStatus } from './payhero';
import { verifiedPaymentStatus } from './payment-verification';
type PaymentPayload = { isCourseEnrollment?: boolean; enrollmentId?: string; courseId?: string; items?: { id: string; quantity: number }[] };
export async function reconcilePayment(id: string) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id } });
  if (payment.status !== 'PENDING') return payment;
  const reference = payment.merchantRequestId || payment.checkoutRequestId;
  if (/^(TEMP_|TEST_|COURSE_)/.test(reference)) return payment;
  const live = await getPayHeroTransactionStatus(reference);
  const status = verifiedPaymentStatus(payment.amount, reference, live);
  if (status === 'PENDING') return payment;
  const payload = payment.cartItems as PaymentPayload | null;
  await prisma.$transaction(async tx => {
    const changed = await tx.payment.updateMany({ where: { id, status: 'PENDING' }, data: {
      status, mpesaReceiptNumber: live?.provider_reference || live?.third_party_reference || payment.mpesaReceiptNumber,
      resultDesc: status === 'COMPLETED' ? 'Payment verified with the provider.' : 'The payment was not completed.',
    } });
    if (!changed.count || status !== 'COMPLETED') return;
    if (payload?.isCourseEnrollment && payload.enrollmentId && payload.courseId) {
      await tx.enrollment.updateMany({ where: { id: payload.enrollmentId, userId: payment.userId, courseId: payload.courseId, status: 'PENDING' }, data: { status: 'APPROVED', paymentInfo: 'Payment verified with the provider.' } });
    } else if (Array.isArray(payload?.items)) {
      for (const item of payload.items) {
        if (/^[a-f\d]{24}$/i.test(item.id) && Number.isInteger(item.quantity)) await tx.cart.deleteMany({ where: { id: item.id, userId: payment.userId, quantity: item.quantity } });
      }
    }
  });
  return prisma.payment.findUniqueOrThrow({ where: { id } });
}

