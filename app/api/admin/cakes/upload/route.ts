import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const price = parseFloat(formData.get('price') as string);

    if (!file || !name || !type || isNaN(price)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'public/uploads/cakes');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/cakes/${filename}`;

    // Save to DB
    const cake = await prisma.cake.create({
      data: {
        name,
        type,
        price,
        image: imageUrl,
        rating: 5,
      },
    });

    return NextResponse.json({ success: true, cake });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}