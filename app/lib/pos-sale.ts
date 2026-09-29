import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { menu } from './catalog';
import { reconcilePayment } from './reconcile-payment';

// Server-side pricing for till sales. The browser only says WHAT was sold and
// how many; prices, totals and discount limits are decided here.

export class PosSaleError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

/** Largest discount a cashier may give on their own, as a share of the subtotal. */
export const CASHIER_MAX_DISCOUNT = 0.2;
/** Upper bound for hand-priced ("custom") items, to catch typos and abuse. */
export const MAX_CUSTOM_PRICE = 200_000;
const MAX_QTY = 999;

export interface SaleLine {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  subtotal: number;
  custom?: boolean;
  notes?: string;
}

type RawItem = { productId?: unknown; name?: unknown; price?: unknown; quantity?: unknown; notes?: unknown };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const money = (n: number) => Math.round(n * 100) / 100;

/** Prices each ticket line from the catalog. Only `custom-*` lines keep a typed price. */
export async function priceTicket(raw: unknown): Promise<SaleLine[]> {
  if (!Array.isArray(raw) || raw.length === 0) throw new PosSaleError('Order must contain at least one item.');
  if (raw.length > 100) throw new PosSaleError('Too many lines on one ticket.');

  const items = raw as RawItem[];
  const cakeIds = items.map((i) => str(i.productId, 40)).filter((id) => /^[a-f\d]{24}$/i.test(id));
  const cakes = cakeIds.length
    ? await prisma.cake.findMany({ where: { id: { in: cakeIds } }, select: { id: true, name: true, price: true } })
    : [];
  const cakeById = new Map(cakes.map((c) => [c.id, c]));

  return items.map((item) => {
    const productId = str(item.productId, 60);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new PosSaleError(`Quantity must be a whole number between 1 and ${MAX_QTY}.`);
    }
    const notes = str(item.notes, 300) || undefined;

    // The till must charge what it showed. If the price changed since the till
    // loaded it, stop so the cashier can tell the customer the new amount.
    const catalogLine = (name: string, category: string, price: number | null) => {
      const shown = Number(item.price);
      if (price && Number.isFinite(shown) && Math.abs(shown - price) > 0.005) {
        throw new PosSaleError(`The price of ${name} is now ${price.toLocaleString()} (the till showed ${shown.toLocaleString()}). The till has been updated — check the total with the customer.`, 409);
      }
      return line(productId, name, category, price ?? 0, quantity, notes);
    };

    const cake = cakeById.get(productId);
    if (cake) return catalogLine(cake.name, 'Cakes', cake.price);
    for (const [group, products] of Object.entries(menu)) {
      const p = products.find((x) => x.id === productId);
      if (p) return catalogLine(p.name, group.charAt(0).toUpperCase() + group.slice(1), p.price);
    }
    // Off-menu item typed in at the till: the only place a price comes from the
    // cashier. It is kept, but labelled, bounded, and visible in reports.
    if (productId.startsWith('custom-')) {
      const name = str(item.name, 120);
      const price = Number(item.price);
      if (!name) throw new PosSaleError('Custom items need a name.');
      if (!Number.isFinite(price) || price <= 0 || price > MAX_CUSTOM_PRICE) {
        throw new PosSaleError(`Custom item price must be between 1 and ${MAX_CUSTOM_PRICE.toLocaleString()}.`);
      }
      return { ...line(productId, name, 'Custom', price, quantity, notes), custom: true };
    }
    throw new PosSaleError('An item on this ticket is no longer on the menu. Remove it and add it again.', 409);
  });
}

function line(productId: string, name: string, category: string, price: number, quantity: number, notes?: string): SaleLine {
  if (!Number.isFinite(price) || price <= 0) throw new PosSaleError(`${name} has no valid price.`, 409);
  return { productId, name, category, price, quantity, subtotal: money(price * quantity), ...(notes && { notes }) };
}

/** Clamps a requested discount to what this role may give. */
export function allowedDiscount(requested: unknown, subtotal: number, role: string): number {
  const d = Number(requested) || 0;
  if (d < 0) throw new PosSaleError('Discount cannot be negative.');
  const limit = ['ADMIN', 'SUPER_ADMIN'].includes(role) ? subtotal : subtotal * CASHIER_MAX_DISCOUNT;
  if (d > limit + 0.005) {
    throw new PosSaleError(
      ['ADMIN', 'SUPER_ADMIN'].includes(role)
        ? 'Discount cannot exceed the order total.'
        : `Cashiers can give at most ${CASHIER_MAX_DISCOUNT * 100}% discount. Ask an admin for more.`,
      403,
    );
  }
  return money(d);
}

/** M-Pesa receipts are 10 letters/digits, e.g. QK84XYZ12A. */
export function normalizeMpesaCode(code: unknown): string {
  const c = str(code, 20).toUpperCase().replace(/\s+/g, '');
  if (!/^[A-Z0-9]{10}$/.test(c)) throw new PosSaleError('Enter the 10-character M-Pesa code from the customer’s message.');
  return c;
}

/** Throws if this M-Pesa code already paid for a till sale or an online order. */
export async function assertMpesaCodeUnused(code: string) {
  const [sale, payment] = await Promise.all([
    prisma.posSale.findFirst({ where: { mpesaCode: code }, select: { saleNumber: true } }),
    prisma.payment.findFirst({ where: { mpesaReceiptNumber: code }, select: { id: true } }),
  ]);
  if (sale) throw new PosSaleError(`M-Pesa code ${code} was already used on sale ${sale.saleNumber}.`, 409);
  if (payment) throw new PosSaleError(`M-Pesa code ${code} already paid for an online order.`, 409);
}

/** POS-20260928-7F3K9Q2M: 8 random characters, so numbers don't collide. */
export function newSaleNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `POS-${date}-${randomBytes(5).toString('hex').toUpperCase().slice(0, 8)}`;
}

// --- one ticket, from request to recorded sale ------------------------------

export const STAFF_ROLES = ['CASHIER', 'ADMIN', 'SUPER_ADMIN'];
/** An online M-Pesa order may be settled at the till only once its STK push has clearly lapsed. */
const STK_GRACE_MS = 15 * 60 * 1000;

/** A ticket that has been checked and priced, waiting to be paid for. */
export interface PreparedSale {
  lines: SaleLine[];
  subtotal: number;
  discount: number;
  total: number;
  online: { id: string; source: string } | null;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
}

export interface Cashier { id: string; name: string; role: string }

type StoredOrder = { items?: { cakeName?: string; name?: string; price?: number; quantity?: number }[]; deliveryFee?: number };

/** A pending website order being paid for at the till: its lines and amount come from the stored order. */
async function storefrontOrder(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) throw new PosSaleError('Unknown online order.', 404);
  let payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new PosSaleError('Unknown online order.', 404);
  if ((payment.cartItems as { isCourseEnrollment?: boolean } | null)?.isCourseEnrollment) {
    throw new PosSaleError('Course payments cannot be settled at the till.', 409);
  }
  const payOnDelivery = payment.merchantRequestId === 'PAY_ON_DELIVERY';
  if (!payOnDelivery && payment.status === 'PENDING') {
    // An STK push may still land; ask the provider before taking money twice.
    payment = await reconcilePayment(payment.id);
    if (payment.status === 'PENDING' && Date.now() - payment.createdAt.getTime() < STK_GRACE_MS) {
      throw new PosSaleError('This order’s M-Pesa payment is still in progress. Try again in a few minutes.', 409);
    }
  }
  if (payment.status !== 'PENDING') {
    throw new PosSaleError(`This order is already ${payment.status.toLowerCase()}.`, 409);
  }

  const stored = (payment.cartItems as StoredOrder | null) || {};
  const lines: SaleLine[] = (stored.items || []).map((it, i) => {
    const price = Number(it.price) || 0;
    const quantity = Number(it.quantity) || 1;
    return {
      productId: `online-${payment!.id}-${i}`,
      name: it.cakeName || it.name || 'Website item',
      category: 'Website Order',
      price,
      quantity,
      subtotal: money(price * quantity),
    };
  });
  if (stored.deliveryFee && stored.deliveryFee > 0) {
    lines.push({ productId: 'delivery-fee', name: 'Delivery Fee', category: 'Delivery', price: stored.deliveryFee, quantity: 1, subtotal: stored.deliveryFee });
  }
  return { lines, amount: payment.amount };
}

/** Validates and prices a ticket sent by the till. Nothing is written. */
export async function prepareSale(body: Record<string, unknown>, role: string): Promise<PreparedSale> {
  const raw = body.onlineOrder as { id?: unknown; source?: unknown } | undefined;
  const online = raw && typeof raw.id === 'string' && typeof raw.source === 'string' ? { id: raw.id, source: raw.source } : null;

  let lines: SaleLine[];
  let subtotal: number;
  if (online?.source === 'storefront') {
    const order = await storefrontOrder(online.id);
    lines = order.lines;
    subtotal = order.amount;
  } else {
    lines = await priceTicket(body.items);
    subtotal = money(lines.reduce((s, l) => s + l.subtotal, 0));
  }

  const discount = allowedDiscount(body.discount, subtotal, role);
  const total = money(subtotal - discount);
  if (total <= 0) throw new PosSaleError('The total must be above zero.');

  const text = (v: unknown, max: number) => str(v, max) || null;
  return {
    lines, subtotal, discount, total, online,
    customerName: text(body.customerName, 150),
    customerPhone: text(body.customerPhone, 30),
    notes: text(body.notes, 1000),
  };
}

/** Saves a paid ticket as a sale, and settles the website order or custom-cake enquiry it belongs to. */
export async function recordSale(
  sale: PreparedSale,
  payment: { method: 'CASH' | 'MPESA'; amountPaid: number; changeDue: number; mpesaCode: string | null },
  cashier: Cashier,
  opts: { moneyAlreadyTaken?: boolean } = {},
) {
  const saleNumber = newSaleNumber();
  let notes = sale.notes;

  // Claim the website order first, so two tills can't both settle it.
  let claimed: { id: string; desc: string } | null = null;
  if (sale.online?.source === 'storefront') {
    const desc = `Paid at POS (${payment.method}) by ${cashier.name}. Receipt ${saleNumber}.`;
    const res = await prisma.payment.updateMany({
      where: { id: sale.online.id, status: 'PENDING' },
      data: { status: 'COMPLETED', resultDesc: desc, ...(payment.mpesaCode && { mpesaReceiptNumber: payment.mpesaCode }) },
    });
    if (res.count) claimed = { id: sale.online.id, desc };
    else if (!opts.moneyAlreadyTaken) throw new PosSaleError('This order was just settled at another till.', 409);
    // The customer has already paid by M-Pesa, so the sale must be kept — flag it instead.
    else notes = `${notes ? notes + ' | ' : ''}WARNING: website order was already settled elsewhere — check for a double payment.`;
  }

  try {
    const created = await prisma.posSale.create({
      data: {
        saleNumber,
        cashierId: cashier.id,
        cashierName: cashier.name,
        items: JSON.parse(JSON.stringify(sale.lines)),
        subtotal: sale.subtotal,
        discount: sale.discount,
        total: sale.total,
        paymentMethod: payment.method,
        amountPaid: payment.amountPaid,
        changeDue: payment.changeDue,
        mpesaCode: payment.mpesaCode,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        notes,
        status: 'COMPLETED',
      },
    });

    if (sale.online?.source === 'custom_cake' && /^[a-f\d]{24}$/i.test(sale.online.id)) {
      await prisma.customOrder.updateMany({
        where: { id: sale.online.id, status: { in: ['pending', 'in_progress', 'quoted'] } },
        data: { status: 'completed' },
      });
    }
    return created;
  } catch (error) {
    if (claimed) {
      // The sale didn't save: put the order back in the queue (only undoing our own claim).
      await prisma.payment.updateMany({
        where: { id: claimed.id, status: 'COMPLETED', resultDesc: claimed.desc },
        data: { status: 'PENDING', mpesaReceiptNumber: null, resultDesc: 'POS settlement failed; order returned to the queue.' },
      }).catch(() => {});
    }
    throw error;
  }
}
