import { getAppSession } from '@/app/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getAppSession();
    if (!session?.user || (session.user.id !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch payments (which represent orders in this context)
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Transform payment data into structured orders
    const orders = payments.map((payment) => {
      let rawItems: any[] = [];
      let deliveryDetails: any = null;

      if (payment.cartItems) {
        if (Array.isArray(payment.cartItems)) {
          rawItems = payment.cartItems;
        } else if (typeof payment.cartItems === 'object') {
          const cartObj = payment.cartItems as any;
          if (cartObj.isCourseEnrollment) {
            rawItems = [{
              cakeName: `Course: ${cartObj.courseTitle || 'Baking Class'} (${cartObj.level || 'Professional'})`,
              quantity: 1,
              price: payment.amount,
            }];
          } else if (Array.isArray(cartObj.items)) {
            rawItems = cartObj.items;
          }
          deliveryDetails = cartObj.deliveryDetails || null;
        }
      }

      const formattedItems = rawItems.map((item) => ({
        name: item.cakeName || item.name || 'Bakery Item',
        quantity: item.quantity || 1,
        price: item.price || 0,
        cakeType: item.cakeType || '',
        image: item.image || '',
      }));

      return {
        id: payment.id,
        status: payment.status.toLowerCase(),
        total: payment.amount,
        phoneNumber: payment.phoneNumber,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        resultDesc: payment.resultDesc,
        deliveryDetails,
        items: formattedItems,
        createdAt: payment.createdAt.toISOString(),
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
