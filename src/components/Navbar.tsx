import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-black/[0.03]">
            <div className="container px-4 h-16 flex items-center justify-between mx-auto">
                <Link href="/" className="flex items-center space-x-2 active:scale-95 transition-transform">
                    <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center overflow-hidden shadow-lg">
                        <img src="/logo.png" alt="Logo" className="h-6 w-6 invert" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-black uppercase">
                        Zash
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    {session?.user ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-block text-[10px] font-black uppercase text-zinc-400">
                                {session.user.name}
                            </span>
                            <UserMenu user={session.user} />
                        </div>
                    ) : (
                        <Link href="/api/auth/signin">
                            <Button size="sm" className="rounded-full bg-black text-white px-6 font-black text-xs uppercase tracking-widest h-10 shadow-lg active:scale-95 transition-all">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
