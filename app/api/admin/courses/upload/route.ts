import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import { ImageUploadError, saveImage } from '@/app/lib/uploads';

const text = (value: FormDataEntryValue | null, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : '';

export async function POST(request: NextRequest) {
  try {
    // Ensure user is logged in and is an ADMIN
    const session = await getAppSession();
    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = text(formData.get('title'), 150);
    const description = text(formData.get('description'), 5000);
    const level = text(formData.get('level'), 60);
    const price = Number(formData.get('price'));
    const image = formData.get('image');

    if (!title || !description || !level || !Number.isFinite(price) || price <= 0 || !(image instanceof File)) {
      return NextResponse.json({ error: 'Provide a title, description, level, image, and a price above 0.' }, { status: 400 });
    }

    // Validates the file's real type and size, and picks a random file name.
    const imagePath = await saveImage(image, 'courses');

    const course = await prisma.course.create({
      data: { title, description, level, price, image: imagePath },
    });

    return NextResponse.json({ message: 'Course uploaded successfully', course }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Course upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
