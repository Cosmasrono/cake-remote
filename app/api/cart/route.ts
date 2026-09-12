// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import { findProduct } from '@/app/lib/checkout';

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getAppSession();
  return session?.user?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cakeName, cakeType } = body;

    if (typeof cakeName !== 'string' || typeof cakeType !== 'string' || !cakeName || !cakeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await findProduct(cakeName, cakeType);
    if (!product) return NextResponse.json({ error: 'This product is not available online.' }, { status: 409 });
    const { price, image } = product;
    const existingItem = await prisma.cart.findFirst({
      where: { cakeName, cakeType, userId },
    });

    let cartItem;
    if (existingItem) {
      if (existingItem.quantity >= 50) return NextResponse.json({ error: 'Maximum quantity is 50.' }, { status: 400 });
      cartItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: 1 }, price, image },
      });
    } else {
      cartItem = await prisma.cart.create({
        data: { userId, cakeName, cakeType, price, image, quantity: 1 },
      });
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const quantity = Number(searchParams.get('quantity') ?? '0');

    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return NextResponse.json(
        { error: 'Valid cart item ID and quantity are required' },
        { status: 400 }
      );
    }

    const item = await prisma.cart.findFirst({ where: { id, userId } });
    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const updated = await prisma.cart.update({
      where: { id },
      data: { quantity },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    const item = await prisma.cart.findFirst({ where: { id, userId } });
    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    await prisma.cart.delete({ where: { id } });
    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
