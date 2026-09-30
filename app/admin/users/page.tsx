import { redirect } from 'next/navigation';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';
import UsersManager from './UsersManager';

export default async function AdminUsersPage() {
  const session = await getAppSession();

  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role || '')) {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    where: { OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="bakery-container bakery-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">STAFF & USER ACCOUNTS</p>
          <h1 className="font-serif text-4xl">Team & Cashier Directory</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/pos" className="bakery-button">
            Open POS Terminal →
          </Link>
          <Link href="/admin/dashboard" className="bakery-button secondary">
            Admin Dashboard
          </Link>
        </div>
      </div>

      <UsersManager initialUsers={JSON.parse(JSON.stringify(users))} currentUser={{ id: session.user.id, role: session.user.role }} />
    </main>
  );
}
