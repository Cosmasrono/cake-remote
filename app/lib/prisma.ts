// lib/prisma.ts (create this file)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In Next.js dev mode, if the cached Prisma instance was created before posSale was added, refresh it
if (globalForPrisma.prisma && !(globalForPrisma.prisma as any).posSale) {
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;