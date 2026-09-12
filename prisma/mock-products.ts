/**
 * Mock products, for testing the storefront and the bag/checkout flow.
 *
 *   pnpm mock:products          insert the cakes and courses
 *   pnpm mock:products:clean    remove them again
 *   pnpm mock:products:reset    remove, then insert (safe to repeat)
 *
 * Records are matched by name/title on --clean, so nothing that was already in
 * the database is touched. Every cake carries a real price, because the
 * storefront disables "Add to bag" for anything priced null or zero.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cakes = [
  { name: 'Chocolate Celebration', type: 'Layer Cake', price: 3500, image: '/images/13.jpg', rating: 5 },
  { name: 'Red Velvet Classic', type: 'Layer Cake', price: 3800, image: '/images/12.jpg', rating: 5 },
  { name: 'Vanilla Buttercream', type: 'Celebration Cake', price: 2900, image: '/images/14.jpg', rating: 4 },
  { name: 'Black Forest', type: 'Celebration Cake', price: 4200, image: '/images/11.jpg', rating: 5 },
  { name: 'Lemon Drizzle Loaf', type: 'Loaf Cake', price: 1600, image: '/images/2.jpg', rating: 4 },
  { name: 'Carrot & Walnut', type: 'Loaf Cake', price: 1800, image: '/images/3.jpg', rating: 4 },
  { name: 'Marble Bundt', type: 'Bundt Cake', price: 2400, image: '/images/4.jpg', rating: 5 },
  { name: 'Vanilla Cupcakes (6)', type: 'Cupcake', price: 900, image: '/images/5.jpg', rating: 5 },
  { name: 'Chocolate Cupcakes (6)', type: 'Cupcake', price: 950, image: '/images/1.jpg', rating: 4 },
  { name: 'Passion Fruit Cheesecake', type: 'Cheesecake', price: 3200, image: '/images/7.jpg', rating: 5 },
];

const courses = [
  {
    title: 'Baking Foundations',
    description: 'Four Saturdays covering creaming, folding, oven management, and the three sponges every baker should know by heart. Ingredients and an apron are included, and you take home everything you bake.',
    level: 'Beginner',
    price: 12000,
    image: '/images/cake2.jpg',
  },
  {
    title: 'Buttercream & Piping',
    description: 'Learn to make silky Swiss meringue buttercream, colour it well, and pipe borders, rosettes, and script that hold their shape in Nairobi heat.',
    level: 'Intermediate',
    price: 15000,
    image: '/images/12.jpg',
  },
  {
    title: 'Fondant & Tiered Cakes',
    description: 'Structure, dowelling, and covering tiers cleanly. By the end of the six sessions you will have built and finished a three-tier cake on your own.',
    level: 'Advanced',
    price: 24000,
    image: '/images/13.jpg',
  },
  {
    title: 'The Cake Business Intensive',
    description: 'Costing a cake so it actually turns a profit, photographing your work, handling enquiries and deposits, and planning a week of orders around one oven.',
    level: 'Professional',
    price: 18000,
    image: '/images/14.jpg',
  },
];

async function clean() {
  const removedCakes = await prisma.cake.deleteMany({ where: { name: { in: cakes.map(c => c.name) } } });
  const removedCourses = await prisma.course.deleteMany({ where: { title: { in: courses.map(c => c.title) } } });
  console.log(`Removed ${removedCakes.count} cakes and ${removedCourses.count} courses.`);
}

async function insert() {
  const existingCakes = await prisma.cake.count({ where: { name: { in: cakes.map(c => c.name) } } });
  const existingCourses = await prisma.course.count({ where: { title: { in: courses.map(c => c.title) } } });
  if (existingCakes || existingCourses) {
    console.log(`Already in place: ${existingCakes} cakes, ${existingCourses} courses. Use --reset to replace them, or --clean to remove them.`);
    return;
  }

  for (const cake of cakes) await prisma.cake.create({ data: cake });
  for (const course of courses) await prisma.course.create({ data: course });

  console.log(`Added ${cakes.length} cakes and ${courses.length} courses.`);
  console.log('Cake prices:', `KSh ${Math.min(...cakes.map(c => c.price))} – ${Math.max(...cakes.map(c => c.price))}`);
  console.log('Course prices:', `KSh ${Math.min(...courses.map(c => c.price))} – ${Math.max(...courses.map(c => c.price))}`);
  console.log('\nOpen http://localhost:3000 to browse them.');
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
