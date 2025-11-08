import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pendingEnrollments = await prisma.enrollment.findMany({
      where: { status: EnrollmentStatus.PENDING },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'asc' },
    });

    return NextResponse.json(pendingEnrollments, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending enrollments' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
