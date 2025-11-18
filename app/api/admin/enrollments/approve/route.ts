// app/api/admin/enrollments/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const enrollmentId = formData.get('enrollmentId') as string;

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    // Update enrollment status to APPROVED
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'APPROVED' },
    });

    // Redirect back to admin dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    
  } catch (error) {
    console.error('Error approving enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to approve enrollment' },
      { status: 500 }
    );
  }
}