// app/components/PromotionBanner.tsx
import { prisma } from '@/app/lib/prisma';
import { Megaphone, Sparkles } from 'lucide-react';

async function getTodaysPromotion() {
  const now = new Date();
  const currentDay = now.getDay();

  // Set to start of day for date comparisons (ignore time)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  return await prisma.promotion.findFirst({
    where: {
      active: true,
      daysOfWeek: {
        has: currentDay,
      },
      OR: [
        // No date restrictions
        { startDate: null, endDate: null },
        // Only start date set
        {
          startDate: { lte: todayEnd },
          endDate: null
        },
        // Only end date set
        {
          startDate: null,
          endDate: { gte: todayStart }
        },
        // Both dates set
        {
          startDate: { lte: todayEnd },
          endDate: { gte: todayStart }
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function PromotionBanner() {
  const promotion = await getTodaysPromotion();

  if (!promotion) return null;

  return (
    <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
          }}
        />
      </div>

      {/* Sparkle decorations */}
      <div className="absolute top-2 left-10 animate-pulse">
        <Sparkles className="w-4 h-4 text-yellow-300" />
      </div>
      <div className="absolute bottom-2 right-20 animate-pulse delay-75">
        <Sparkles className="w-3 h-3 text-yellow-300" />
      </div>
      <div className="absolute top-3 right-40 animate-pulse delay-150">
        <Sparkles className="w-5 h-5 text-yellow-300" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Animated megaphone icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 animate-ping" />
            <div className="relative bg-white rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6 text-pink-600 animate-bounce" />
            </div>
          </div>

          {/* Message with card effect */}
          <div className="flex-1 max-w-4xl">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl border-2 border-white/50 transform hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg animate-pulse">
                      🎉 TODAY'S SPECIAL
                    </span>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 animate-gradient">
                    {promotion.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative element on the right */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-yellow-300 rounded-full blur-md opacity-50 animate-ping" />
            <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
              <span className="text-2xl">🎂</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
    </div>
  );
}