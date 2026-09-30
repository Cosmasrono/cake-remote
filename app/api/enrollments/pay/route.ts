// app/api/enrollments/pay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import { initiatePayHeroStkPush, formatKenyanPhoneNumber, getPayHeroConfig } from '@/app/lib/payhero';

export async function POST(request: NextRequest) {
  let payment: any = null;

  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to enroll.' }, { status: 401 });
    }

    try { getPayHeroConfig(); } catch {
      return NextResponse.json({ error: 'M-Pesa payments are unavailable right now. Choose "Enquire before paying" and our team will contact you.' }, { status: 503 });
    }

    const { courseId, phoneNumber, customerName, isTestMode } = await request.json();
    if (isTestMode) return NextResponse.json({ error: 'Simulated payments are not available.' }, { status: 400 });

    if (typeof courseId !== 'string' || !/^[a-f\d]{24}$/i.test(courseId) || typeof phoneNumber !== 'string') {
      return NextResponse.json({ error: 'Course ID and phone number are required.' }, { status: 400 });
    }

    const cleanPhone = formatKenyanPhoneNumber(phoneNumber);
    if (!/^0[17]\d{8}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Invalid Kenyan phone number provided.' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Find or create enrollment
    let enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
      },
    });

    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId,
          phoneNumber: cleanPhone,
          status: EnrollmentStatus.PENDING,
          paymentInfo: 'M-Pesa Express Checkout Initiated',
        },
      });
    } else if (enrollment.status === EnrollmentStatus.APPROVED) {
      return NextResponse.json({ error: 'You are already enrolled and approved for this course!' }, { status: 400 });
    }

    // A prompt already sent for this course in the last 2 minutes: keep waiting on
    // that one instead of charging the student twice.
    const recent = await prisma.payment.findMany({
      where: { userId: session.user.id, status: 'PENDING', createdAt: { gte: new Date(Date.now() - 120_000) } },
    });
    const inFlight = recent.find((p) => (p.cartItems as { courseId?: string } | null)?.courseId === course.id);
    if (inFlight) {
      return NextResponse.json({
        message: 'A payment prompt was already sent. Please check your phone.',
        paymentId: inFlight.id,
        amount: inFlight.amount,
        courseTitle: course.title,
        enrollmentId: enrollment.id,
      });
    }

    const tempCheckoutId = `COURSE_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const feeAmount = Math.ceil(course.price);

    // Save payment record
    payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        phoneNumber: cleanPhone,
        amount: feeAmount,
        status: 'PENDING',
        merchantRequestId: '',
        checkoutRequestId: tempCheckoutId,
        cartItems: {
          isCourseEnrollment: true,
          courseId: course.id,
          courseTitle: course.title,
          enrollmentId: enrollment.id,
          level: course.level,
        },
      },
    });

    // Initiate real STK Push via PayHero
    const stkResponse = await initiatePayHeroStkPush({
      amount: feeAmount,
      phoneNumber: cleanPhone,
      externalReference: payment.id,
      customerName: customerName || session.user.name || undefined,
    });

    const checkoutRequestId = stkResponse.CheckoutRequestID || stkResponse.reference || payment.id;
    const merchantRequestId = stkResponse.reference || stkResponse.CheckoutRequestID || '';

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        checkoutRequestId,
        merchantRequestId,
      },
    });

    return NextResponse.json({
      message: 'STK Push initiated successfully. Please check your phone.',
      paymentId: payment.id,
      checkoutRequestId,
      amount: feeAmount,
      courseTitle: course.title,
      enrollmentId: enrollment.id,
      reference: stkResponse.reference,
    });
  } catch (error: any) {
    console.error('Error initiating course payment:', error);

    if (payment?.id) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          resultDesc: error?.response?.data?.error_message || error?.message || 'STK Push failed',
        },
      }).catch((e) => console.error('Failed to update payment status:', e));
    }

    return NextResponse.json(
      { error: 'We could not send the M-Pesa prompt. Check the number and try again.' },
      { status: 502 }
    );
  }
}
