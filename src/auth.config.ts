import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/signup',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // Protected routes logic
            const isProtected =
                nextUrl.pathname.startsWith('/tour/new') ||
                (nextUrl.pathname.startsWith('/tour/') && nextUrl.pathname.endsWith('/edit'));

            if (isProtected) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
