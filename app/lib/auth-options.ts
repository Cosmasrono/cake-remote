import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';

// Typed representation of our extended session user
export interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

export interface AppSession {
  user: AppUser;
  expires: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your-email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as AppUser).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      return { ...session, user: { ...session.user, role: token.role as string, id: token.id as string } };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Typed wrapper around getServerSession that returns our extended AppSession.
 * Use this in all API routes instead of calling getServerSession(authOptions) directly.
 */
export async function getAppSession(): Promise<AppSession | null> {
  return nextAuthGetServerSession(authOptions) as Promise<AppSession | null>;
}