import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client'; // Import EnrollmentStatus

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, email, name, phoneNumber, paymentInfo } = body;

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
        email: email || null,
        name: name || null,
        phoneNumber: phoneNumber || null,
        status: EnrollmentStatus.PENDING,
        paymentInfo,
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

// app/api/enrollments/route.ts
export async function GET() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, level: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to include userId in the response
    const enrollmentsWithUserId = enrollments.map(enrollment => ({
      ...enrollment,
      userId: enrollment.userId, // Make sure this is included
    }));

    return NextResponse.json(enrollmentsWithUserId);
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