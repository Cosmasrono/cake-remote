import { prisma } from './prisma';
import { menu } from './catalog';
import { PosProduct } from './pos';

const CATEGORY: Record<string, PosProduct['category']> = { shawarmas: 'Shawarmas', burgers: 'Burgers', pizzas: 'Pizzas' };

/**
 * What the till can sell, at the same prices as the website: cakes from the
 * database, the savoury menu from catalog.ts. An item without a price is not
 * sold online, so it is not sold at the till either.
 */
export async function loadPosProducts(): Promise<PosProduct[]> {
  const cakes = await prisma.cake.findMany({
    select: { id: true, name: true, type: true, price: true, image: true },
    orderBy: { name: 'asc' },
  });
  const cakeProducts: PosProduct[] = cakes
    .filter((c) => Number.isFinite(c.price) && c.price > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      category: 'Cakes',
      price: c.price,
      image: c.image || '/images/cake1.jpg',
      description: c.type || 'Freshly baked artisan cake',
    }));

  const savoury: PosProduct[] = Object.entries(menu).flatMap(([group, items]) =>
    items
      .filter((p) => p.price && Number.isFinite(p.price) && p.price > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: CATEGORY[group],
        price: p.price as number,
        image: p.image,
        description: p.description,
      })),
  );

  return [...cakeProducts, ...savoury];
}
