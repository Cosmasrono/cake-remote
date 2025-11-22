import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use Redis or database in production)
const paymentStatuses = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkoutRequestId = searchParams.get('checkoutRequestId');
  
  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'Missing checkoutRequestId' }, { status: 400 });
  }
  
  const status = paymentStatuses.get(checkoutRequestId) || { status: 'pending' };
  
  return NextResponse.json({
    status: status.status || 'pending',
    checkoutRequestId,
    details: status
  });
}

// Export the storage so callback can access it
export { paymentStatuses };