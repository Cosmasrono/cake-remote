// app/api/custom-orders/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const occasion = formData.get('occasion') as string | null;
    const date = formData.get('date') as string | null;
    const flavor = formData.get('flavor') as string | null;
    const size = formData.get('size') as string | null;
    const message = formData.get('message') as string | null;
    const inspirationLink = formData.get('inspirationLink') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    let imageUrl = null;

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const filename = `${Date.now()}-${imageFile.name}`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', 'custom-orders', filename);

      // Ensure directory exists
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/custom-orders/${filename}`;
    }

    const customOrder = await prisma.customOrder.create({
      data: {
        name,
        phone,
        occasion,
        date,
        flavor,
        size,
        message,
        inspirationLink,
        image: imageUrl,
      },
    });

    return NextResponse.json({ success: true, order: customOrder }, { status: 201 });
  } catch (error) {
    console.error('Error saving custom order:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}