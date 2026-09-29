import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import PosSalesReports from './PosSalesReports';

export default async function AdminPosSalesPage() {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login');
  }

  let sales: any[] = [];
  try {
    if ((prisma as any).posSale) {
      sales = await (prisma as any).posSale.findMany({
        orderBy: { createdAt: 'desc' },
        take: 300,
      });
    } else {
      const rawRes: any = await prisma.$runCommandRaw({
        find: 'pos_sales',
        sort: { createdAt: -1 },
        limit: 300,
      });
      sales = (rawRes?.cursor?.firstBatch || []).map((doc: any) => ({
        id: doc._id?.$oid || doc._id || doc.saleNumber,
        saleNumber: doc.saleNumber,
        cashierId: doc.cashierId?.$oid || doc.cashierId,
        cashierName: doc.cashierName,
        items: doc.items || [],
        subtotal: doc.subtotal || 0,
        discount: doc.discount || 0,
        total: doc.total || 0,
        paymentMethod: doc.paymentMethod || 'CASH',
        amountPaid: doc.amountPaid || doc.total || 0,
        changeDue: doc.changeDue || 0,
        mpesaCode: doc.mpesaCode || null,
        customerName: doc.customerName || null,
        customerPhone: doc.customerPhone || null,
        notes: doc.notes || null,
        status: doc.status || 'COMPLETED',
        createdAt: doc.createdAt?.$date || doc.createdAt || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.error('Error loading sales in admin page:', err);
  }

  return (
    <main className="bakery-container bakery-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">COUNTER REGISTER AUDIT</p>
          <h1 className="font-serif text-4xl">POS Sales &amp; Cashier Reports</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/pos" className="bakery-button">
            Launch POS Terminal ⚡
          </Link>
          <Link href="/admin/dashboard" className="bakery-button secondary">
            Admin Dashboard
          </Link>
        </div>
      </div>

      <PosSalesReports initialSales={JSON.parse(JSON.stringify(sales))} />
    </main>
  );
}
