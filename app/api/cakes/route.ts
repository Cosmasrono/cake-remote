import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cakes = await prisma.cake.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(cakes);
  } catch (error) {
    console.error('Error fetching cakes:', error);
    return NextResponse.json({ error: 'Failed to fetch cakes' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, price, image, rating } = await request.json();

    if (!name || !type || !price || !image || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCake = await prisma.cake.create({
      data: {
        name,
        type,
        price,
        image,
        rating,
      },
    });

    return NextResponse.json(newCake, { status: 201 });
  } catch (error) {
    console.error('Error creating cake:', error);
    return NextResponse.json({ error: 'Failed to create cake' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}