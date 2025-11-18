import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Use raw MongoDB commands to update roles
    const result = await prisma.$runCommandRaw({
      update: 'User',
      updates: [
        {
          q: { role: 'user' },
          u: { $set: { role: 'USER' } },
          multi: true
        },
        {
          q: { role: 'admin' },
          u: { $set: { role: 'ADMIN' } },
          multi: true
        }
      ]
    });

    return NextResponse.json({
      success: true,
      message: 'Roles updated successfully',
      result
    });
  } catch (error) {
    console.error('Error updating roles:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update roles'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}