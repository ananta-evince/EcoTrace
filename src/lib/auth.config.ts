import type { NextAuthConfig } from 'next-auth';

const protectedRoutes = ['/dashboard', '/track', '/actions', '/profile', '/onboarding'];
const authRoutes = ['/login', '/signup'];

/** Edge-safe auth config (no Node.js-only imports). */
export const authConfig = {
  pages: { signIn: '/login', newUser: '/onboarding' },
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (protectedRoutes.some((r) => pathname.startsWith(r))) {
        if (!isLoggedIn) return false;
        return true;
      }

      if (authRoutes.some((r) => pathname.startsWith(r)) && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
