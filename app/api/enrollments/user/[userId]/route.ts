// app/api/enrollments/user/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }  // Change to Promise
) {
  try {
    const { userId } = await params;  // Add await here

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        courseId: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user enrollments' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}