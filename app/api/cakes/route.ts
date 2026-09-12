import { NextResponse } from 'next/server';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const cakes = await prisma.cake.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cakes);
  } catch (error) {
    console.error('Error fetching cakes:', error);
    return NextResponse.json({ error: 'Failed to fetch cakes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Server-side role guard
    const session = await getAppSession();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, type, price, image, rating } = await request.json();

    if (!name || !type || !price || !image || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCake = await prisma.cake.create({
      data: { name, type, price, image, rating },
    });

    return NextResponse.json(newCake, { status: 201 });
  } catch (error) {
    console.error('Error creating cake:', error);
    return NextResponse.json({ error: 'Failed to create cake' }, { status: 500 });
  }
}