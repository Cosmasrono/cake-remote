import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASSKEY;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL;

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount } = await request.json();

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing phone number or amount' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!CONSUMER_KEY || !CONSUMER_SECRET || !PASSKEY || !SHORTCODE || !CALLBACK_URL) {
      console.error('Missing M-Pesa environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    console.log('Formatted phone:', formattedPhone);

    // 1. Generate Access Token
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;
    console.log('Access token obtained');

    // 2. Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const stkPushPayload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount), // Round up to nearest whole number
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: 'CakeOrder',
      TransactionDesc: 'Cake Purchase',
    };

    console.log('STK Push Payload:', JSON.stringify(stkPushPayload, null, 2));

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
    return NextResponse.json({
      message: 'STK Push initiated successfully. Please check your phone.',
      ...stkPushResponse.data
    }, { status: 200 });

  } catch (error) {
    console.error('Error initiating Mpesa STK Push:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
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
  }
}