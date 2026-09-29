import { NextRequest, NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import { formatKenyanPhoneNumber } from '@/app/lib/payhero';
import { reconcilePayment } from '@/app/lib/reconcile-payment';

export async function POST(request: NextRequest) {
  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const courseId = typeof body.courseId === 'string' ? body.courseId : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? formatKenyanPhoneNumber(body.phoneNumber) : '';

    if (!/^[a-f\d]{24}$/i.test(courseId) || !/^0[17]\d{8}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Enter a valid Kenyan phone number, e.g. 0712 345 678.' },
        { status: 400 }
      );
    }
    if (!(await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }))) {
      return NextResponse.json({ error: 'This course is no longer available.' }, { status: 404 });
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: {
          in: [EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED],
        },
      },
    });

    if (existingEnrollment) {
      const statusMessage =
        existingEnrollment.status === EnrollmentStatus.PENDING
          ? 'You already have a pending enrollment for this course.'
          : 'You are already enrolled in this course.';
      return NextResponse.json({ error: statusMessage }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        phoneNumber,
        status: EnrollmentStatus.PENDING,
      },
      include: {
        course: { select: { title: true, level: true, price: true } },
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getAppSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // A student who closed the payment popup early: settle their recent course
    // payments with PayHero now, so the enrolment shows as paid.
    const pending = await prisma.payment.findMany({
      where: { userId: session.user.id, status: 'PENDING', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    await Promise.all(
      pending
        .filter((p) => (p.cartItems as { isCourseEnrollment?: boolean } | null)?.isCourseEnrollment)
        .slice(0, 3)
        .map((p) => reconcilePayment(p.id).catch(() => null)),
    );

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: { id: true, title: true, level: true, price: true, image: true, whatsappLink: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // The class group link is only for students whose place is confirmed.
    return NextResponse.json(
      enrollments.map(({ course: { whatsappLink, ...course }, ...e }) => ({
        ...e,
        course,
        classGroupLink:
          e.status === EnrollmentStatus.APPROVED && whatsappLink?.startsWith('https://chat.whatsapp.com/')
            ? whatsappLink
            : null,
      })),
    );
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}