import { getAppSession } from '@/app/lib/auth-options';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';


export async function GET() {
  try {
    // Public list: never include whatsappLink — it's the paid class group, and
    // is only revealed by /api/check-payment after a verified payment.
    const courses = await prisma.course.findMany({
      select: { id: true, title: true, description: true, level: true, price: true, image: true, createdAt: true, updatedAt: true },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { title, description, level, price, image } = await request.json();

    if (!title || !description || !level || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        level,
        price,
        image,
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
