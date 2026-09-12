// app/api/custom-orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ImageUploadError, saveImage } from '@/app/lib/uploads';
import { orderReference } from '@/app/lib/custom-orders';

const text = (value: FormDataEntryValue | null, limit: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : null;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = text(formData.get('name'), 90);
    const phone = text(formData.get('phone'), 30);
    if (!name || !phone) return NextResponse.json({ error: 'Please share your name and phone number.' }, { status: 400 });

    const file = formData.get('image');
    const image = file instanceof File && file.size > 0 ? await saveImage(file, 'custom-orders') : null;

    const order = await prisma.customOrder.create({
      data: {
        name,
        phone,
        occasion: text(formData.get('occasion'), 120),
        date: text(formData.get('date'), 40),
        flavor: text(formData.get('flavor'), 120),
        size: text(formData.get('size'), 120),
        message: text(formData.get('message'), 200),
        inspirationLink: text(formData.get('inspirationLink'), 500),
        image,
        source: text(formData.get('source'), 20) === 'whatsapp' ? 'whatsapp' : 'form',
      },
    });

    return NextResponse.json({ success: true, reference: orderReference(order.id), order }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Error saving custom order:', error);
    return NextResponse.json({ error: 'We could not save your enquiry. Please try again.' }, { status: 500 });
  }
}
