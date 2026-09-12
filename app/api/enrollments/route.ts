import { NextRequest, NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';

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
    const { courseId, phoneNumber } = body;

    if (!courseId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId or phoneNumber' },
        { status: 400 }
      );
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

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: { id: true, title: true, level: true, price: true, image: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}