import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/app/lib/auth-options';
import { prisma } from '@/app/lib/prisma';
import { ImageUploadError, saveImage } from '@/app/lib/uploads';

const text = (value: FormDataEntryValue | null, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : '';

export async function POST(request: NextRequest) {
  try {
    const session = await getAppSession();
    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    const name = text(formData.get('name'), 150);
    const type = text(formData.get('type'), 150);
    const price = Number(formData.get('price'));

    if (!(file instanceof File) || !name || !type || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Provide an image, name, type, and a price above 0.' }, { status: 400 });
    }

    // Validates the file's real type and size, and picks a random file name.
    const imageUrl = await saveImage(file, 'cakes');

    const cake = await prisma.cake.create({
      data: { name, type, price, image: imageUrl, rating: 5 },
    });

    return NextResponse.json({ success: true, cake });
  } catch (error) {
    if (error instanceof ImageUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
