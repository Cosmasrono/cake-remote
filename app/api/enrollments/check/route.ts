import { getAppSession } from '@/app/lib/auth-options';
// app/api/enrollments/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getAppSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing userId or courseId' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
        status: {
          in: [EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED]
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    if (enrollment) {
      return NextResponse.json({
        isEnrolled: true,
        status: enrollment.status,
        enrollment
      });
    }

    return NextResponse.json({
      isEnrolled: false,
      status: null
    });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}