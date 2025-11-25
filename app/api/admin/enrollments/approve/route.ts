import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next'; // Corrected import path
import { authOptions } from '@/app/lib/auth-options';
import { Session } from 'next-auth'; // Import Session type

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = (await getServerSession(authOptions)) as Session | null; // Cast session
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url)); // Added error param
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

    // Update enrollment status to APPROVED
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.APPROVED,
      },
    });

    // Redirect back to admin dashboard with success message
    return NextResponse.redirect(
      new URL(`/admin?success=Enrollment for ${enrollment.user.name} in ${enrollment.course.title} approved successfully`, request.url)
    );
  } catch (error) {
    console.error('Error approving enrollment:', error);
    return NextResponse.redirect(new URL('/admin?error=failed_to_approve', request.url));
  } finally {
    await prisma.$disconnect();
  }
}