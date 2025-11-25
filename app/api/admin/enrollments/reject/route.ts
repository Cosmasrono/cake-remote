import { PrismaClient, EnrollmentStatus, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options'; // Using alias

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session?.user || session?.user?.role !== UserRole.ADMIN) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const { enrollmentId } = await req.json();

  if (!enrollmentId) {
    return new Response(JSON.stringify({ message: 'Enrollment ID is required' }), { status: 400 });
  }

  try {
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.REJECTED },
      include: { course: true, user: true },
    });

    return new Response(JSON.stringify(updatedEnrollment), { status: 200 });
  } catch (error) {
    console.error('Error rejecting enrollment:', error);
    return new Response(JSON.stringify({ message: 'Failed to reject enrollment' }), { status: 500 });
  }
}