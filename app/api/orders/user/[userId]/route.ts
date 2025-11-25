import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // Explicitly type params as Promise
) {
  try {
    const { userId } = await params; // Add await here

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch payments (which represent orders in this context)
    const payments = await prisma.payment.findMany({
      where: { userId: userId }, // Filter by userId
      orderBy: { createdAt: 'desc' },
    });

    // Transform payment data into the Order interface expected by OrdersTab
    const orders = payments.map(payment => ({
      id: payment.id,
      status: payment.status.toLowerCase(),
      total: payment.amount,
      items: payment.cartItems ? (payment.cartItems as any[]).map(item => ({
        name: item.cakeName || item.name,
        quantity: item.quantity,
        price: item.price,
      })) : [],
      createdAt: payment.createdAt.toISOString(),
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
