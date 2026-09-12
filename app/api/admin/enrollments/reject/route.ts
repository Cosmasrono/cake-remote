import { NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  const session = await getAppSession();

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { enrollmentId } = await req.json();

  if (!enrollmentId) {
    return NextResponse.json({ message: 'Enrollment ID is required' }, { status: 400 });
  }

  try {
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.REJECTED },
      include: { course: true, user: true },
    });

    return NextResponse.json(updatedEnrollment, { status: 200 });
  } catch (error) {
    console.error('Error rejecting enrollment:', error);
    return NextResponse.json({ message: 'Failed to reject enrollment' }, { status: 500 });
  }
}