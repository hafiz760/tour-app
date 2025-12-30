import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsed = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(credentials);

                if (parsed.success) {
                    const { email, password } = parsed.data;
                    await connectDB();
                    const user = await User.findOne({ email });
                    if (!user) return null;

                    const match = await bcrypt.compare(password, user.password!);
                    if (match) {
                        return {
                            id: user._id.toString(),
                            email: user.email,
                            name: user.name,
                        };
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
});
