// Quick script to check promotions in the database
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function checkPromotions() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    let output = '';
    output += '=== PROMOTION DEBUG ===\n';
    output += `Current Date: ${today.toLocaleDateString()}\n`;
    output += `Current Day of Week: ${currentDay} (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)\n`;
    output += '\n--- All Promotions in Database ---\n';

    const allPromotions = await prisma.promotion.findMany();
    output += `Total promotions: ${allPromotions.length}\n\n`;

    allPromotions.forEach((promo, index) => {
        output += `Promotion ${index + 1}:\n`;
        output += `  ID: ${promo.id}\n`;
        output += `  Message: ${promo.message}\n`;
        output += `  Active: ${promo.active}\n`;
        output += `  Days of Week: ${JSON.stringify(promo.daysOfWeek)}\n`;
        output += `  Start Date: ${promo.startDate}\n`;
        output += `  End Date: ${promo.endDate}\n`;
        output += `  Created: ${promo.createdAt}\n`;
        output += '\n';
    });

    output += '\n--- Checking for Today\'s Promotion ---\n';
    const todaysPromotion = await prisma.promotion.findFirst({
        where: {
            active: true,
            daysOfWeek: {
                has: currentDay,
            },
            OR: [
                { startDate: null, endDate: null },
                { startDate: { lte: today }, endDate: null },
                { startDate: null, endDate: { gte: today } },
                { startDate: { lte: today }, endDate: { gte: today } },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });

    if (todaysPromotion) {
        output += '✅ Found matching promotion for today:\n';
        output += `  Message: ${todaysPromotion.message}\n`;
        output += `  Days: ${JSON.stringify(todaysPromotion.daysOfWeek)}\n`;
    } else {
        output += '❌ No matching promotion found for today\n';
        output += '   This is why the banner is not showing!\n';
        output += `\n   Checking why:\n`;
        output += `   - Current day: ${currentDay}\n`;

        // Check each promotion individually
        for (const promo of allPromotions) {
            output += `\n   Promotion: "${promo.message}"\n`;
            output += `     - Active: ${promo.active} ${!promo.active ? '❌ NOT ACTIVE' : '✅'}\n`;
            output += `     - Days: ${JSON.stringify(promo.daysOfWeek)} ${!promo.daysOfWeek.includes(currentDay) ? `❌ Does not include day ${currentDay}` : '✅'}\n`;

            const dateMatches =
                (!promo.startDate && !promo.endDate) ||
                (promo.startDate && promo.startDate <= today && !promo.endDate) ||
                (!promo.startDate && promo.endDate && promo.endDate >= today) ||
                (promo.startDate && promo.endDate && promo.startDate <= today && promo.endDate >= today);

            output += `     - Date range: ${dateMatches ? '✅ Matches' : '❌ Does not match'}\n`;
            output += `       Start: ${promo.startDate || 'none'}, End: ${promo.endDate || 'none'}\n`;
        }
    }

    console.log(output);
    fs.writeFileSync('promotion-debug.txt', output);
    output += '\n\n✅ Output saved to promotion-debug.txt\n';

    await prisma.$disconnect();
}

checkPromotions().catch(console.error);
