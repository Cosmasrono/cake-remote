import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getAppSession } from '@/app/lib/auth-options';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 150) : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return NextResponse.json({ error: 'Enter a valid email and a password of at least 8 characters.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const validRoles = ['USER', 'CASHIER', 'ADMIN'];
    const assignedRole = validRoles.includes(role) ? role : 'CASHIER';

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error creating staff user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getAppSession();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    const validRoles = ['USER', 'CASHIER', 'ADMIN', 'SUPER_ADMIN'];
    if (typeof userId !== 'string' || !/^[a-f\d]{24}$/i.test(userId) || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }
    // Nobody changes their own role — no self-promotion, no accidental lock-out.
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 403 });
    }
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Only a super admin may grant SUPER_ADMIN or change a super admin's role.
    if ((role === 'SUPER_ADMIN' || target.role === 'SUPER_ADMIN') && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only a super admin can grant or remove super admin access.' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
