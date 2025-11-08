import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'admin';
}