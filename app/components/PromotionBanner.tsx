// components/PromotionBanner.tsx
import { prisma } from '@/app/lib/prisma'; // Update this import
import { Megaphone } from 'lucide-react';

async function getActivePromotion() {
  return await prisma.promotion.findFirst({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function PromotionBanner() {
  const promotion = await getActivePromotion();

  if (!promotion) return null;

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-pink-700 px-6 py-3 sm:px-3.5 sm:before:flex-1">
      <div className="flex flex-1 items-center justify-center gap-x-4">
        <Megaphone className="h-6 w-6 flex-none text-white animate-pulse" />
        <p className="text-sm sm:text-base font-bold leading-6 text-white text-center">
          {promotion.message}
        </p>
      </div>
      <div className="hidden sm:block sm:flex-1" />
    </div>
  );
}