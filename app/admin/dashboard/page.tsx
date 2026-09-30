import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import AdminChat from './AdminChat';

export default async function AdminDashboardPage() {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) redirect('/login');

  const [users, payments, posSales, cakes, pending, enquiries, enrolments] = await Promise.all([
    prisma.user.count(),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
    (prisma as any).posSale
      ? prisma.posSale.count()
      : prisma.$runCommandRaw({ count: 'pos_sales' }).then((r: any) => r?.n || 0).catch(() => 0),
    prisma.cake.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.customOrder.count({ where: { status: 'pending' } }),
    prisma.enrollment.findMany({
      where: { status: 'PENDING' },
      take: 50,
      orderBy: { enrolledAt: 'asc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return (
    <main className="bakery-container bakery-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">NIMU&apos;S ADMINISTRATION</p>
          <h1 className="font-serif text-4xl">The bakery, at a glance.</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/pos" className="bakery-button">
            Launch POS Terminal ⚡
          </Link>
          <Link href="/" className="bakery-button secondary">
            Home page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        {[
          ['Registered Users', users],
          ['Online Payments', payments],
          ['POS Counter Sales', posSales],
          ['Cake products', cakes],
          ['Pending enrolments', pending],
          ['New enquiries', enquiries],
        ].map(([label, count]) => (
          <div className="checkout-panel" key={label}>
            <p className="text-xs text-stone-500">{label}</p>
            <p className="font-serif text-4xl mt-3">{count}</p>
          </div>
        ))}
      </div>

      <AdminChat />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {[
          { path: '/', title: 'Home page', description: 'Visit the bakery storefront.' },
          { path: '/pos', title: 'POS Terminal', description: 'Open the point-of-sale checkout counter for staff.', isTerminal: true },
          { path: '/admin/pos-sales', title: 'POS Sales & Reports', description: 'Review counter register sales, cashier totals, and receipts.' },
          { path: '/admin/reports', title: 'System Reports', description: 'Users, sales, expenses, profit and loss, and M-Pesa readiness.' },
          { path: '/admin/expenses', title: 'Expenses', description: 'Record spending and get AI insights on profit.' },
          { path: '/admin/cakes', title: 'Cake collection', description: 'Add, edit, and manage your cakes.' },
          { path: '/admin/courses', title: 'Baking courses', description: 'Create courses and enrolment details.' },
          { path: '/admin/orders', title: 'Online Orders & Payments', description: 'Review web customer payments.' },
          { path: '/admin/custom-orders', title: 'Custom enquiries', description: 'Review cake requests from the form and WhatsApp.' },
          { path: '/admin/users', title: 'Staff & User Directory', description: 'Manage cashiers, staff accounts, and customers.' },
          { path: '/admin/promotions', title: 'Promotions', description: 'Schedule messages for the storefront.' },
        ].map(({ path, title, description, isTerminal }) => (
          <Link
            href={path}
            className={`checkout-panel hover:border-[#713c46] transition-colors ${
              isTerminal ? 'bg-[#f8f3f0] border-[#713c46]/40' : ''
            }`}
            key={path}
          >
            <div className="flex justify-between items-start">
              <h2>{title}</h2>
              {isTerminal && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#713c46] text-white">
                  Live
                </span>
              )}
            </div>
            <p className="text-sm text-stone-500 mt-1">{description}</p>
            <span className="text-link mt-4 block">Open →</span>
          </Link>
        ))}
      </div>

      <section className="checkout-panel overflow-x-auto">
        <h2>Enrolments awaiting review</h2>
        {!enrolments.length ? (
          <p className="text-sm text-stone-500">You are up to date. No enrolments need review.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {enrolments.map((e) => (
                <tr key={e.id}>
                  <td className="p-3">{e.user.name}</td>
                  <td className="p-3">{e.course.title}</td>
                  <td className="p-3">{e.phoneNumber || e.user.email}</td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      {['approve', 'reject'].map((action) => (
                        <form
                          key={action}
                          action={'/api/admin/enrollments/' + action}
                          method="POST"
                        >
                          <input type="hidden" name="enrollmentId" value={e.id} />
                          <button className="text-link capitalize">{action}</button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
