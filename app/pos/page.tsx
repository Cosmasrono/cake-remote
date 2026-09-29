import { redirect } from 'next/navigation';
import { getAppSession } from '@/app/lib/auth-options';
import { loadPosProducts } from '@/app/lib/pos-catalog';
import { PosProduct } from '@/app/lib/pos';
import PosTerminalClient from './PosTerminalClient';

export const metadata = {
  title: "Point of Sale (POS) | Japhe's Bakery & Fast Food",
  description: "Touch counter register for in-store orders, fast checkout, and thermal receipts.",
};

export default async function PosPage() {
  const session = await getAppSession();

  // Authentication & Role Guard: Only CASHIER, ADMIN, or SUPER_ADMIN
  if (!session?.user) {
    redirect('/login?callbackUrl=/pos');
  }

  if (!['CASHIER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/?error=pos_access_denied');
  }

  // Same products and prices as the website; the till keeps them fresh after this.
  let products: PosProduct[] = [];
  try {
    products = await loadPosProducts();
  } catch (err) {
    console.error('Error loading POS products:', err);
  }

  return (
    <PosTerminalClient
      initialProducts={products}
      cashier={{
        id: session.user.id,
        name: session.user.name || session.user.email || 'Cashier',
        email: session.user.email || '',
        role: session.user.role,
      }}
    />
  );
}
