import { test, expect } from '@playwright/test';
import { verifiedPaymentStatus } from '../app/lib/payment-verification';
test('provider verification rejects forged success, missing amounts, underpayments and mismatched references', () => {
  expect(verifiedPaymentStatus(2000, 'ref', { status: 'SUCCESS', amount: 1 })).toBe('PENDING');
  expect(verifiedPaymentStatus(2000, 'ref', { status: 'SUCCESS' })).toBe('PENDING');
  expect(verifiedPaymentStatus(2000, 'ref', { status: 'SUCCESS', amount: 2000, reference: 'someone-else' })).toBe('PENDING');
  expect(verifiedPaymentStatus(2000, 'ref', { status: 'QUEUED', amount: 2000 })).toBe('PENDING');
  expect(verifiedPaymentStatus(2000, 'ref', null)).toBe('PENDING');
  expect(verifiedPaymentStatus(2000, 'ref', { status: 'SUCCESS', amount: 2000, reference: 'ref' })).toBe('COMPLETED');
});
test('anonymous requests cannot mutate cakes or read customer orders', async ({ request }) => {
  const id = '507f1f77bcf86cd799439011';
  expect((await request.delete('/api/admin/cakes/' + id)).status()).toBe(403);
  expect((await request.put('/api/admin/cakes/' + id, { data: { name: 'Changed' } })).status()).toBe(403);
  expect((await request.get('/api/orders/user/' + id)).status()).toBe(403);
  expect((await request.get('/api/admin/enrollments')).status()).toBe(403);
  expect((await request.post('/api/mpesa', { data: { isTestMode: true } })).status()).toBe(401);
  expect((await request.get('/api/check-payment?paymentId=' + id + '&simulateSuccess=true')).status()).toBe(401);
});

