import { prisma } from './prisma';
import { financialReport, type ReportRow } from './system-report';

export async function loadSystemReport(from: Date, to: Date) {
  const createdAt = { gte: from, lt: to };
  const [sales, payments, expenses, users, enrolments, enquiries, cakes, courses, promotions] = await Promise.all([
    prisma.posSale.findMany({ where: { createdAt }, select: { total: true, status: true, paymentMethod: true } }),
    prisma.payment.findMany({ where: { createdAt }, select: { amount: true, status: true, resultDesc: true } }),
    prisma.expense.findMany({ where: { date: createdAt }, select: { amount: true, category: true } }),
    prisma.user.findMany({ select: { role: true, isActive: true, deletedAt: true, createdAt: true } }),
    prisma.enrollment.groupBy({ by: ['status'], where: { createdAt }, _count: { _all: true } }),
    prisma.customOrder.groupBy({ by: ['status'], where: { createdAt }, _count: { _all: true } }),
    prisma.cake.count(), prisma.course.count(), prisma.promotion.count({ where: { active: true } }),
  ]);
  const rows = financialReport(sales, payments, expenses);
  const add = (section: string, metric: string, value: number) => rows.push({ section, metric, value, unit: 'count' } as ReportRow);
  const visible = users.filter((user) => !user.deletedAt);
  add('Users — current totals', 'Customers', visible.filter((user) => user.role === 'USER').length);
  add('Users — current totals', 'Staff including admins', visible.filter((user) => user.role !== 'USER').length);
  add('Users — current totals', 'Enabled', visible.filter((user) => user.isActive !== false).length);
  add('Users — current totals', 'Disabled', visible.filter((user) => user.isActive === false).length);
  add('Users — current totals', 'Deleted', users.length - visible.length);
  add('Users — selected period', 'Accounts registered (includes later deletions)', users.filter((user) => user.createdAt >= from && user.createdAt < to).length);
  for (const group of enrolments) add('Enrolments created in period', group.status, group._count._all);
  for (const group of enquiries) add('Custom enquiries created in period', group.status, group._count._all);
  add('Catalogue — current totals', 'Cakes', cakes);
  add('Catalogue — current totals', 'Courses', courses);
  add('Catalogue — current totals', 'Promotions marked active', promotions);
  return rows;
}
