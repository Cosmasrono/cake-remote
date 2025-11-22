import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();
  
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const formData = await request.formData();
    const enrollmentId = formData.get('enrollmentId') as string;

    if (!enrollmentId) {
      return NextResponse.redirect(new URL('/admin?error=missing_enrollment_id', request.url));
    }

    // Check if enrollment exists and is pending
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      }
    });

    if (!enrollment) {
      return NextResponse.redirect(new URL('/admin?error=enrollment_not_found', request.url));
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      return NextResponse.redirect(new URL(`/admin?error=already_${enrollment.status.toLowerCase()}`, request.url));
    }

    // Update enrollment status to REJECTED
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.REJECTED,
      },
    });

    // Redirect back to admin dashboard with success message
    return NextResponse.redirect(
      new URL(`/admin?success=Enrollment for ${enrollment.user.name} in ${enrollment.course.title} rejected`, request.url)
    );
  } catch (error) {
    console.error('Error rejecting enrollment:', error);
    return NextResponse.redirect(new URL('/admin?error=failed_to_reject', request.url));
  } finally {
    await prisma.$disconnect();
  }
}