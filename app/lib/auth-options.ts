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

/** How often a signed-in user's role is re-read from the database. */
const ROLE_RECHECK_MS = 5 * 60 * 1000;

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

        // Emails are matched case-insensitively (older accounts may be stored in mixed case).
        const user = await prisma.user.findFirst({
          where: { email: { equals: credentials.email.trim(), mode: 'insensitive' } },
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
        token.roleCheckedAt = Date.now();
        return token;
      }
      // The role lives in the token, so re-read it every few minutes: a demoted
      // or deleted staff member loses access quickly, not when the token expires.
      if (token.id && Date.now() - Number(token.roleCheckedAt || 0) > ROLE_RECHECK_MS) {
        const current = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true } });
        token.role = current?.role ?? '';
        if (!current) token.id = '';
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      return { ...session, user: { ...session.user, role: token.role as string, id: token.id as string } };
    },
  },
  // .env names it AUTH_SECRET; next-auth v4 reads NEXTAUTH_SECRET. Accept both,
  // so tokens are never signed with next-auth's development fallback.
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

/**
 * Typed wrapper around getServerSession that returns our extended AppSession.
 * Use this in all API routes instead of calling getServerSession(authOptions) directly.
 */
export async function getAppSession(): Promise<AppSession | null> {
  return nextAuthGetServerSession(authOptions) as Promise<AppSession | null>;
}