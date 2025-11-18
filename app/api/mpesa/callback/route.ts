// app/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    let updateData: any = {
      resultCode,
      resultDesc,
    };

    if (resultCode === 0) {
      // Payment successful
      updateData.status = 'COMPLETED';

      // Extract metadata
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      for (const item of metadata) {
        if (item.Name === 'MpesaReceiptNumber') {
          updateData.mpesaReceiptNumber = item.Value;
        }
        if (item.Name === 'TransactionDate') {
          updateData.transactionDate = String(item.Value);
        }
      }

      console.log('Payment successful! Receipt:', updateData.mpesaReceiptNumber);
    } else {
      // Payment failed
      updateData.status = 'FAILED';
      console.log('Payment failed:', resultDesc);
    }

    // Update payment in database
    const updatedPayment = await prisma.payment.update({
      where: { checkoutRequestId },
      data: updateData,
    });

    console.log('Payment updated in database:', updatedPayment.id);

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}