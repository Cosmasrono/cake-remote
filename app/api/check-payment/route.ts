// app/api/check-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Disable caching for this API route
  request.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  request.headers.set('Pragma', 'no-cache');
  request.headers.set('Expires', '0');

  const { searchParams } = new URL(request.url);
  const checkoutRequestId = searchParams.get('checkoutRequestId');
  
  if (!checkoutRequestId) {
    return NextResponse.json(
      { error: 'Missing checkoutRequestId' }, 
      { status: 400 }
    );
  }
  
  try {
    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId },
    });

    if (!payment) {
      console.log(`⏳ Payment not found yet: ${checkoutRequestId}`);
      return NextResponse.json({ 
        status: 'pending', 
        message: 'Payment record not found yet' 
      });
    }
    
    console.log(`📊 Payment status for ${checkoutRequestId}: ${payment.status}`);
    
    // Return status in lowercase for frontend consistency
    return NextResponse.json({
      status: payment.status.toLowerCase(),
      checkoutRequestId: payment.checkoutRequestId,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
      amount: payment.amount,
      resultDesc: payment.resultDesc,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
    
  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check payment status', 
        status: 'failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}