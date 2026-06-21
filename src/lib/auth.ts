import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';
import { getAuthSecret } from '@/lib/env';
import { authConfig } from '@/lib/auth.config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: getAuthSecret(),
  cookies: {
    sessionToken: {
      name: 'ecotrace.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const ip =
          req.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const rateCheck = checkRateLimit(`auth:${ip}`);
        if (!rateCheck.allowed) return null;

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        resetRateLimit(`auth:${ip}`);
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
});
