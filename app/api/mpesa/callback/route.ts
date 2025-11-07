import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));
    
    // Extract the result
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      console.log('Payment successful!');
      
      // TODO: Update your database with the successful payment
      // You can access transaction details from stkCallback.CallbackMetadata
      
    } else {
      // Payment failed
      console.log('Payment failed:', stkCallback.ResultDesc);
    }
    
    // Always return success to M-Pesa
    return NextResponse.json({ 
      ResultCode: 0,
      ResultDesc: 'Success'
    });
    
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return NextResponse.json({ 
      ResultCode: 1,
      ResultDesc: 'Failed'
    }, { status: 500 });
  }
}