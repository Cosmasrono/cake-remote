import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    await prisma.cake.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ message: 'Cake deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cake not found' }, { status: 404 });
    }
    console.error(`Error deleting cake with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete cake' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const { name, type, price, rating } = await request.json();

  try {
    const updatedCake = await prisma.cake.update({
      where: {
        id: id,
      },
      data: {
        name,
        type,
        price,
        rating,
      },
    });
    return NextResponse.json(updatedCake, { status: 200 });
  } catch (error) {
    console.error(`Error updating cake with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update cake' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
