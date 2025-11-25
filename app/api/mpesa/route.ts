// app/api/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  let payment: any = null; // Declare at function scope
  
  try {
    const { phoneNumber, amount, cartItems, userId } = await request.json(); // Destructure userId

    if (!phoneNumber || !amount || !userId) { // Add userId to validation
      return NextResponse.json(
        { error: 'Missing phone number, amount, or user ID' }, // Update error message
        { status: 400 }
      );
    }

    const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
    const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
    const PASSKEY = process.env.MPESA_PASSKEY;
    const SHORTCODE = process.env.MPESA_SHORTCODE;
    const CALLBACK_URL = process.env.MPESA_CALLBACK_URL;

    if (!CONSUMER_KEY || !CONSUMER_SECRET || !PASSKEY || !SHORTCODE || !CALLBACK_URL) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Get access token
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenResponse.data.access_token;

    // Save initial payment to database with PENDING status
    payment = await prisma.payment.create({
      data: {
        userId, // Add userId here
        phoneNumber: formattedPhone,
        amount: Math.ceil(amount),
        cartItems: cartItems || null,
        status: 'PENDING',
        merchantRequestId: '',
        checkoutRequestId: ''
      },
    });

    // Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const stkPushPayload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: 'CakeOrder',
      TransactionDesc: 'Cake Purchase',
    };

    const stkPushResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('STK Push Response:', stkPushResponse.data);

    // Update the payment record with Mpesa details
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        merchantRequestId: stkPushResponse.data.MerchantRequestID,
        checkoutRequestId: stkPushResponse.data.CheckoutRequestID,
      },
    });

    console.log('Payment saved to database:', payment.id);

    return NextResponse.json({
      message: 'STK Push initiated successfully. Please check your phone.',
      paymentId: payment.id,
      checkoutRequestId: stkPushResponse.data.CheckoutRequestID,
      ...stkPushResponse.data
    }, { status: 200 });

  } catch (error) {
    console.error('Error initiating Mpesa STK Push:', error);
    
    // Update payment status if payment was created
    if (payment?.id) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED', 
          resultDesc: 'STK Push initiation failed' 
        },
      }).catch(e => console.error('Failed to update payment status:', e));
    }

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { 
          error: 'Failed to initiate Mpesa STK Push', 
          details: error.response?.data || error.message 
        },
        { status: error.response?.status || 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate Mpesa STK Push', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}