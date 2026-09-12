// app/api/admin/custom-orders/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import { CUSTOM_ORDER_STATUSES, type CustomOrderStatus } from '@/app/lib/custom-orders';

export async function POST(request: NextRequest) {
  const back = (query = '') => NextResponse.redirect(new URL('/admin/custom-orders' + query, request.url), 303);
  try {
    const session = await getAppSession();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url), 303);
    }

    const formData = await request.formData();
    const id = formData.get('id');
    const status = formData.get('status');
    if (typeof id !== 'string' || !id) return back('?error=missing_enquiry');
    if (typeof status !== 'string' || !CUSTOM_ORDER_STATUSES.includes(status as CustomOrderStatus)) return back('?error=unknown_status');

    await prisma.customOrder.update({ where: { id }, data: { status } });
    revalidatePath('/admin/custom-orders');
    revalidatePath('/admin/dashboard');
    return back();
  } catch (error) {
    console.error('Error updating custom order status:', error);
    return back('?error=update_failed');
  }
}
