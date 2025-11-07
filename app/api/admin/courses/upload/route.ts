import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Corrected import path
import { prisma } from '@/app/prisma/prisma'; // Changed to named import

export async function POST(request: NextRequest) {
  try {
    // Ensure user is logged in (no specific role check)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const level = formData.get('level') as string;
    const price = parseFloat(formData.get('price') as string);
    const image = formData.get('image') as File;

    if (!title || !description || !level || isNaN(price) || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle image upload
    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `${Date.now()}-${image.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courses');
    
    // Ensure the upload directory exists
    await require('fs').promises.mkdir(uploadDir, { recursive: true });

    const imagePath = `/uploads/courses/${filename}`;
    await writeFile(path.join(process.cwd(), 'public', imagePath), buffer);

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level,
        price,
        image: imagePath,
      },
    });

    return NextResponse.json({ message: 'Course uploaded successfully', course }, { status: 201 });
  } catch (error) {
    console.error('Course upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
