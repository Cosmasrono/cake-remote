import { getAppSession } from '@/app/lib/auth-options';
// app/api/enrollments/user/[userId]/route.ts
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }  // Change to Promise
) {
  try {
    const { userId } = await params;
    const session = await getAppSession();
    if (!session?.user || (session.user.id !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });  // Add await here

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
  }
}