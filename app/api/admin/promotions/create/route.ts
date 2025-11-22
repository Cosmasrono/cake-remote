import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma'; // Use the singleton

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data instead of JSON
    const formData = await req.formData();
    const message = formData.get('message') as string;
    const active = formData.get('active') === 'on'; // Checkbox sends 'on' when checked

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await prisma.promotion.create({
      data: {
        message,
        active,
      },
    });

    // Redirect back to the promotions page
    return NextResponse.redirect(new URL('/admin/promotions', req.url));
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}