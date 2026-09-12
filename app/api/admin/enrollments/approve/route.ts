import { NextRequest, NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getAppSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    const formData = await request.formData();
    const enrollmentId = formData.get('enrollmentId') as string;

    if (!enrollmentId) {
      return NextResponse.redirect(new URL('/admin?error=missing_enrollment_id', request.url));
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    });

    if (!enrollment) {
      return NextResponse.redirect(new URL('/admin?error=enrollment_not_found', request.url));
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      return NextResponse.redirect(
        new URL(`/admin?error=already_${enrollment.status.toLowerCase()}`, request.url)
      );
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.APPROVED },
    });

    return NextResponse.redirect(
      new URL(
        `/admin?success=Enrollment for ${enrollment.user.name} in ${enrollment.course.title} approved successfully`,
        request.url
      )
    );
  } catch (error) {
    console.error('Error approving enrollment:', error);
    return NextResponse.redirect(new URL('/admin?error=failed_to_approve', request.url));
  }
}