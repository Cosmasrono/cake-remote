import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session: Session | null = await getServerSession(authOptions);
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

    // Check if user is already enrolled in this course
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        status: {
          in: [EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED]
        }
      }
    });

    if (existingEnrollment) {
      const statusMessage = existingEnrollment.status === EnrollmentStatus.PENDING
        ? 'You already have a pending enrollment for this course.'
        : 'You are already enrolled in this course.';

      return NextResponse.json(
        { error: statusMessage },
        { status: 400 }
      );
    }

    // Create new enrollment with PENDING status
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        phoneNumber,
        status: EnrollmentStatus.PENDING,
      },
      include: {
        course: {
          select: { title: true, level: true, price: true }
        }
      }
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get enrollments for the current user
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            price: true,
            image: true
          }
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
  } finally {
    await prisma.$disconnect();
  }
}