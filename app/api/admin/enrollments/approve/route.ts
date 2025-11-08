import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const enrollmentId = formData.get('enrollmentId') as string;

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Missing enrollmentId' },
        { status: 400 }
      );
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.APPROVED,
      },
    });

    return NextResponse.json(updatedEnrollment, { status: 200 });
  } catch (error) {
    console.error('Error approving enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to approve enrollment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
