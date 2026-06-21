import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';
import { getAuthSecret } from '@/lib/env';
import { parseClientIp } from '@/lib/request';
import { authConfig } from '@/lib/auth.config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function buildGoogleProvider() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return Google({ clientId, clientSecret });
}

const googleProvider = buildGoogleProvider();

/** NextAuth instance with credentials and optional Google OAuth. */
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
    ...(googleProvider ? [googleProvider] : []),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const ip = parseClientIp(req.headers?.get('x-forwarded-for'));
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
