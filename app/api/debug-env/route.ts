import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasConsumerKey: !!process.env.MPESA_CONSUMER_KEY,
    hasConsumerSecret: !!process.env.MPESA_CONSUMER_SECRET,
    hasShortcode: !!process.env.MPESA_SHORTCODE,
    hasPasskey: !!process.env.MPESA_PASSKEY,
    hasCallbackUrl: !!process.env.MPESA_CALLBACK_URL,
    // Show first 5 characters only for security
    consumerKeyPreview: process.env.MPESA_CONSUMER_KEY?.substring(0, 5) || 'missing',
    allMpesaKeys: Object.keys(process.env).filter(key => key.startsWith('MPESA')),
    totalEnvVars: Object.keys(process.env).length
  });
}