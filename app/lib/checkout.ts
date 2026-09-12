import { prisma } from './prisma';
import { menu } from './catalog';
export class CheckoutError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function deliveryFee(subtotal: number, method: string) { return method === 'pickup' || subtotal >= 5000 || subtotal === 0 ? 0 : 350; }
export async function findProduct(name: string, type: string) {
  const cake = await prisma.cake.findFirst({ where: { name, type } });
  if (cake && Number.isFinite(cake.price) && cake.price > 0) return { name: cake.name, type: cake.type, price: cake.price, image: cake.image };
  const item = Object.values(menu).flat().find(p => p.name === name && p.description === type);
  if (item?.price && Number.isFinite(item.price)) return { name: item.name, type: item.description, price: item.price, image: item.image };
  return null;
}
export async function getCheckout(userId: string, method: string) {
  if (!['delivery', 'pickup'].includes(method)) throw new CheckoutError('Choose delivery or pickup.');
  const cart = await prisma.cart.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  if (!cart.length) throw new CheckoutError('Your bag is empty.');
  if (cart.length > 100) throw new CheckoutError('Please reduce the number of items in your bag.');
  const items = await Promise.all(cart.map(async item => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) throw new CheckoutError('Choose a quantity between 1 and 50.');
    const product = await findProduct(item.cakeName, item.cakeType);
    if (!product) throw new CheckoutError(`${item.cakeName} is no longer available online. Please remove it from your bag.`, 409);
    return { id: item.id, cakeName: product.name, cakeType: product.type, price: product.price, image: product.image, quantity: item.quantity };
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fee = deliveryFee(subtotal, method);
  return { items, subtotal, deliveryFee: fee, total: Math.ceil(subtotal + fee) };
}

