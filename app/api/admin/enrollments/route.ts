import { getAppSession } from '@/app/lib/auth-options';
import { NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
  }
}
