import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
export default async function AdminDashboardPage() {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN','SUPER_ADMIN'].includes(session.user.role)) redirect('/login');
  const [users, payments, cakes, pending, enquiries, enrolments] = await Promise.all([
    prisma.user.count(), prisma.payment.count({ where: { status: 'COMPLETED' } }), prisma.cake.count(), prisma.enrollment.count({ where: { status: 'PENDING' } }), prisma.customOrder.count({ where: { status: 'pending' } }),
    prisma.enrollment.findMany({ where: { status: 'PENDING' }, take: 50, orderBy: { enrolledAt: 'asc' }, include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } } }),
  ]);
  return <main className="bakery-container bakery-section"><div className="section-heading"><div><p className="eyebrow">JAPHE&apos;S ADMINISTRATION</p><h1 className="font-serif text-4xl">The bakery, at a glance.</h1></div><Link href="/" className="bakery-button secondary">View storefront</Link></div>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">{[['Customers',users],['Confirmed payments',payments],['Cake products',cakes],['Pending enrolments',pending],['New cake enquiries',enquiries]].map(([label,count]) => <div className="checkout-panel" key={label}><p className="text-xs text-stone-500">{label}</p><p className="font-serif text-4xl mt-3">{count}</p></div>)}</div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">{[['cakes','Cake collection','Add, edit, and manage your cakes.'],['courses','Baking courses','Create courses and enrolment details.'],['orders','Orders & payments','Review the latest customer payments.'],['custom-orders','Custom enquiries','Review cake requests from the form and WhatsApp.'],['users','Customer directory','View registered customer accounts.'],['promotions','Promotions','Schedule messages for the storefront.']].map(([path,title,description]) => <Link href={'/admin/' + path} className="checkout-panel hover:border-[#713c46]" key={path}><h2>{title}</h2><p className="text-sm text-stone-500">{description}</p><span className="text-link">Open →</span></Link>)}</div>
    <section className="checkout-panel overflow-x-auto"><h2>Enrolments awaiting review</h2>{!enrolments.length ? <p className="text-sm text-stone-500">You are up to date. No enrolments need review.</p> : <table className="w-full text-left text-sm"><thead className="border-b border-stone-200"><tr><th className="p-3">Student</th><th className="p-3">Course</th><th className="p-3">Contact</th><th className="p-3">Decision</th></tr></thead><tbody>{enrolments.map(e => <tr key={e.id} className="border-b border-stone-100"><td className="p-3">{e.user.name}</td><td className="p-3">{e.course.title}</td><td className="p-3">{e.phoneNumber || e.user.email}</td><td className="p-3"><div className="flex gap-3">{['approve','reject'].map(action => <form key={action} action={'/api/admin/enrollments/' + action} method="POST"><input type="hidden" name="enrollmentId" value={e.id} /><button className="text-link capitalize">{action}</button></form>)}</div></td></tr>)}</tbody></table>}</section>
  </main>;
}

