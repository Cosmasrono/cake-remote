// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cakeName, cakeType, price, image } = body;

    if (!cakeName || !cakeType || !price || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingItem = await prisma.cart.findFirst({
      where: { cakeName, cakeType },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      });
    } else {
      cartItem = await prisma.cart.create({
        data: { cakeName, cakeType, price, image, quantity: 1 },
      });
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();  // Add this
  }
}

export async function GET() {
  try {
    const cartItems = await prisma.cart.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();  // Add this
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    await prisma.cart.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();  // Add this
  }
}