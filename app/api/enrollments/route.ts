import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client'; // Import EnrollmentStatus

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, paymentInfo } = body; // Updated fields

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId or courseId' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: EnrollmentStatus.PENDING, // Set default status to PENDING
        paymentInfo, // Include paymentInfo if provided
      },
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

export async function GET() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } }, // Include user details
        course: { select: { title: true, level: true, price: true } }, // Include course details
      } as const,
      orderBy: { createdAt: 'desc' }, // Order by createdAt
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