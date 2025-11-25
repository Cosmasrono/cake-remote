// app/api/mpesa/callback/route.ts
// IMPORTANT: Create this file at: app/api/mpesa/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    
    console.log('🔔 M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));
    
    const { Body } = callbackData;
    
    if (!Body?.stkCallback) {
      console.error('❌ Invalid callback structure');
      return NextResponse.json({ 
        ResultCode: 1, 
        ResultDesc: 'Invalid callback structure' 
      }, { status: 400 });
    }
    
    const { stkCallback } = Body;
    const checkoutRequestId = stkCallback.CheckoutRequestID;

    if (!checkoutRequestId) {
      console.error('❌ CheckoutRequestID is missing');
      return NextResponse.json({ 
        ResultCode: 1, 
        ResultDesc: 'Missing CheckoutRequestID' 
      }, { status: 400 });
    }

    console.log(`🔍 Processing payment for CheckoutRequestID: ${checkoutRequestId}`);
    console.log(`📊 ResultCode: ${stkCallback.ResultCode}`);
    console.log(`📝 ResultDesc: ${stkCallback.ResultDesc}`);

    let paymentStatus: PaymentStatus = PaymentStatus.FAILED;
    let mpesaReceiptNumber: string | null = null;
    let amount: number | null = null;
    let resultDesc: string = stkCallback.ResultDesc || 'Payment failed';

    if (stkCallback.ResultCode === 0) {
      console.log('✅ Payment successful!');
      paymentStatus = PaymentStatus.COMPLETED;
      
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      console.log('📦 Callback Metadata:', JSON.stringify(metadata, null, 2));
      
      mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const rawAmount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      amount = rawAmount ? parseFloat(rawAmount) : null;
      
      console.log(`💰 Amount: ${amount}, Receipt: ${mpesaReceiptNumber}`);
    } else {
      console.log(`❌ Payment failed: ${stkCallback.ResultDesc}`);
    }

    // Check if payment exists before updating
    const existingPayment = await prisma.payment.findUnique({
      where: { checkoutRequestId }
    });

    if (!existingPayment) {
      console.error(`❌ Payment not found for CheckoutRequestID: ${checkoutRequestId}`);
      return NextResponse.json({
        ResultCode: 1,
        ResultDesc: 'Payment record not found'
      }, { status: 404 });
    }

    console.log(`🔄 Updating payment status to: ${paymentStatus}`);

    // Update payment in database
    const updatedPayment = await prisma.payment.update({
      where: { checkoutRequestId },
      data: {
        status: paymentStatus,
        mpesaReceiptNumber,
        amount: amount || existingPayment.amount,
        resultCode: stkCallback.ResultCode,
        resultDesc: resultDesc,
        updatedAt: new Date(),
      },
    });
    
    console.log('✅ Payment updated successfully:', updatedPayment.id);
    console.log('📄 Updated payment details:', JSON.stringify({
      id: updatedPayment.id,
      status: updatedPayment.status,
      amount: updatedPayment.amount,
      receipt: updatedPayment.mpesaReceiptNumber
    }, null, 2));
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
    
  } catch (error) {
    console.error('💥 Error processing M-Pesa callback:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Failed to process callback'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Handle GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'M-Pesa callback endpoint is active at /api/mpesa/callback',
    timestamp: new Date().toISOString()
  });
}