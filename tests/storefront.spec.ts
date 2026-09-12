import { test, expect } from '@playwright/test';
const id = '507f1f77bcf86cd799439011';
const products = [
  { id, name: 'Chocolate Celebration', type: 'Chocolate', price: 2000, image: '/images/13.jpg' },
  { id: '507f1f77bcf86cd799439012', name: 'Vanilla Occasion', type: 'Vanilla', price: 1500, image: '/images/13.jpg' },
];
test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: null } }));
  await page.route('**/api/promotions', route => route.fulfill({ json: {} }));
  await page.route('**/api/cakes', route => route.fulfill({ json: products }));
});
test('homepage, responsive navigation, product search and custom enquiry', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /A little cake.*A lovely occasion/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('homepage.png'), fullPage: true });
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Our cakes' }).click();
  } else await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Our cakes' }).click();
  await expect(page.getByRole('heading', { name: 'Chocolate Celebration' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search products' }).fill('vanilla');
  await expect(page.getByRole('heading', { name: 'Vanilla Occasion' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chocolate Celebration' })).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Search products' }).fill('no-such-cake');
  await expect(page.getByRole('heading', { name: 'No matches just yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('combobox', { name: 'Sort products' }).selectOption('low');
  await expect(page.locator('.product-card').first().getByRole('heading')).toHaveText('Vanilla Occasion');
  await page.getByRole('button', { name: 'Request a custom cake' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Cakes for the occasion.' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('catalog.png'), fullPage: true });
  expect(errors).toEqual([]);
});
test('checkout preserves the paid amount and items after confirmation', async ({ page }, testInfo) => {
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: { id, name: 'Test Customer', email: 'test@example.com', role: 'USER' }, expires: '2099-01-01T00:00:00.000Z' } }));
  const quote = { items: [{ id, cakeName: 'Chocolate Celebration', price: 2000, quantity: 1, image: '/images/13.jpg' }], subtotal: 2000, deliveryFee: 350, total: 2350 };
  await page.route('**/api/checkout?**', route => route.fulfill({ json: quote }));
  await page.route('**/api/mpesa', async route => {
    const body = route.request().postDataJSON();
    expect(body.expectedAmount).toBe(2350);
    expect(body).not.toHaveProperty('userId');
    expect(body).not.toHaveProperty('isTestMode');
    await route.fulfill({ json: { paymentId: id, amount: 2350, quote } });
  });
  await page.route('**/api/check-payment?**', route => route.fulfill({ json: { status: 'completed', amount: 2350, mpesaReceiptNumber: 'CONFIRMED123' } }));
  await page.goto('/payment');
  await page.getByLabel('Delivery address').fill('Test street, Nairobi');
  await page.getByLabel('M-Pesa phone number').fill('0712345678');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('checkout.png'), fullPage: true });
  await page.getByRole('button', { name: 'Pay Ksh', exact: false }).or(page.getByRole('button', { name: /Pay.*2,350/ })).first().click();
  await expect(page.getByRole('heading', { name: 'Payment received.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chocolate Celebration' })).toBeVisible();
  await expect(page.getByText('CONFIRMED123', { exact: false })).toBeVisible();
  await expect(page.locator('.checkout-total.final')).toContainText('2,350');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('receipt.png'), fullPage: true });
});
test('failed bag updates retain items and explain the failure', async ({ page }) => {
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: { id, name: 'Test', role: 'USER' } } }));
  await page.route('**/api/cart**', route => route.request().method() === 'GET' ? route.fulfill({ json: [{ id, cakeName: 'Chocolate Celebration', price: 2000, quantity: 1, image: '/images/13.jpg' }] }) : route.fulfill({ status: 500, json: { error: 'Unavailable' } }));
  await page.goto('/');
  await page.getByRole('button', { name: /Shopping bag/ }).click();
  await page.getByRole('button', { name: 'Remove Chocolate Celebration', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('could not be updated');
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Chocolate Celebration' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

