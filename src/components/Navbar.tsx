import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { signOut } from 'next-auth/react';

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
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-block text-[10px] font-black uppercase text-zinc-400">
                                {session.user?.name}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-zinc-100 hover:border-black transition-all">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                                            <AvatarFallback className="bg-zinc-900 text-white font-bold">
                                                {session.user?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-2xl border-none shadow-2xl p-2" align="end" forceMount>
                                    <DropdownMenuItem className="rounded-xl font-bold py-3" onClick={() => signOut()}>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="rounded-full bg-black text-white px-6 font-bold h-10">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
