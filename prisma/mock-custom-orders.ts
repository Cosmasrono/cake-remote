/**
 * Mock custom cake enquiries, for testing the admin queue and the WhatsApp reply flow.
 *
 *   pnpm mock:orders          insert the mock enquiries
 *   pnpm mock:orders:clean    remove them again
 *   pnpm mock:orders:reset    remove, then insert (safe to repeat)
 *
 * Every mock record uses a phone number in the 07000000xx range, which is how
 * --clean finds them. Nothing else in the database is touched.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_PHONE_PREFIX = '07000000';
const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

// Covers both channels, every status, and records with only the required fields,
// so the admin page can be checked against its empty-field fallbacks too.
const enquiries = [
  {
    name: 'Amina Wanjiku',
    phone: '0700000001',
    occasion: 'Daughter turning 7',
    date: '2026-09-27',
    flavor: 'Vanilla with strawberry filling',
    size: '8-inch, single tier, serves about 20',
    message: 'Happy Birthday Zawadi!',
    inspirationLink: 'https://www.pinterest.com/pin/1094896029184766/',
    image: '/images/13.jpg',
    source: 'form',
    status: 'pending',
    createdAt: daysAgo(0, 9),
  },
  {
    name: 'Brian Otieno',
    phone: '0700000002',
    occasion: 'Wedding',
    date: '2026-11-14',
    flavor: 'Red velvet, cream cheese frosting',
    size: '3 tiers, serves 120',
    message: 'Brian & Faith',
    inspirationLink: 'https://www.pinterest.com/pin/287878467/',
    image: null,
    source: 'whatsapp',
    status: 'pending',
    createdAt: daysAgo(0, 14),
  },
  {
    // Only the required fields, to exercise the "Not specified" fallbacks.
    name: 'Grace Njeri',
    phone: '0700000003',
    occasion: null,
    date: null,
    flavor: null,
    size: null,
    message: null,
    inspirationLink: null,
    image: null,
    source: 'whatsapp',
    status: 'pending',
    createdAt: daysAgo(1, 17),
  },
  {
    name: 'Samuel Kiprotich',
    phone: '0700000004',
    occasion: 'Office send-off for our manager',
    date: '2026-09-19',
    flavor: 'Chocolate fudge',
    size: '10-inch square, serves 35',
    message: 'All the best, Mr. Mwangi. Thank you for eleven good years with us.',
    inspirationLink: null,
    image: '/images/11.jpg',
    source: 'form',
    status: 'in_progress',
    createdAt: daysAgo(2, 11),
  },
  {
    name: 'Fatuma Hassan',
    phone: '0700000005',
    occasion: 'Baby shower',
    date: '2026-10-04',
    flavor: 'Lemon drizzle',
    size: '2 tiers, serves 45',
    message: 'Welcome, little one',
    inspirationLink: 'https://www.instagram.com/p/C8nQ2xkMabc/',
    image: null,
    source: 'whatsapp',
    status: 'quoted',
    createdAt: daysAgo(4, 15),
  },
  {
    name: 'Peter Mwangi',
    phone: '0700000006',
    occasion: '50th birthday',
    date: '2026-09-06',
    flavor: 'Marble',
    size: '12-inch round, serves 60',
    message: 'Fifty and thriving',
    inspirationLink: null,
    image: '/images/14.jpg',
    source: 'form',
    status: 'completed',
    createdAt: daysAgo(9, 12),
  },
  {
    name: 'Lucy Cherono',
    phone: '0700000007',
    occasion: 'Graduation',
    date: '2026-09-08',
    flavor: 'Carrot cake',
    size: '6-inch, serves 12',
    message: 'Congratulations Dr. Cherono',
    inspirationLink: null,
    image: null,
    source: 'whatsapp',
    status: 'completed',
    createdAt: daysAgo(12, 16),
  },
  {
    name: 'Dennis Kamau',
    phone: '0700000008',
    occasion: 'Corporate launch, needed the same evening',
    date: '2026-08-30',
    flavor: 'Black forest',
    size: '4 tiers, serves 200',
    message: null,
    inspirationLink: null,
    image: null,
    source: 'form',
    status: 'declined',
    createdAt: daysAgo(15, 8),
  },
];

async function clean() {
  const { count } = await prisma.customOrder.deleteMany({
    where: { phone: { startsWith: MOCK_PHONE_PREFIX } },
  });
  console.log(`Removed ${count} mock ${count === 1 ? 'enquiry' : 'enquiries'}.`);
  return count;
}

async function insert() {
  const existing = await prisma.customOrder.count({ where: { phone: { startsWith: MOCK_PHONE_PREFIX } } });
  if (existing) {
    console.log(`${existing} mock ${existing === 1 ? 'enquiry is' : 'enquiries are'} already in place. Use --reset to replace them, or --clean to remove them.`);
    return;
  }
  for (const enquiry of enquiries) await prisma.customOrder.create({ data: enquiry });
  console.log(`Added ${enquiries.length} mock enquiries.`);
  const byStatus = enquiries.reduce<Record<string, number>>((counts, e) => ({ ...counts, [e.status]: (counts[e.status] || 0) + 1 }), {});
  console.log('By status:', byStatus);
  console.log('By channel:', { form: enquiries.filter(e => e.source === 'form').length, whatsapp: enquiries.filter(e => e.source === 'whatsapp').length });
  console.log('\nOpen http://localhost:3000/admin/custom-orders to review them.');
}

async function main() {
  const mode = process.argv.includes('--clean') ? 'clean' : process.argv.includes('--reset') ? 'reset' : 'insert';
  if (mode === 'clean') return clean();
  if (mode === 'reset') await clean();
  await insert();
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
