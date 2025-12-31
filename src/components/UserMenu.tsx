'use client';
import { useState } from 'react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User, KeyRound } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { ChangePasswordDialog } from './ChangePasswordDialog';

interface UserMenuProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-zinc-100 hover:border-black transition-all overflow-hidden">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                        <AvatarFallback className="bg-zinc-900 text-white font-bold">
                            {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-[2rem] border-none shadow-2xl p-2 bg-white/80 backdrop-blur-xl" align="end" forceMount>
                <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black text-black leading-none uppercase">{user.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 truncate">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100 mx-2" />
                <DropdownMenuItem
                    className="rounded-2xl font-black text-xs uppercase tracking-widest py-3 px-4 flex items-center gap-3 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                    onClick={() => setIsPasswordDialogOpen(true)}
                >
                    <KeyRound className="w-4 h-4" />
                    Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="rounded-2xl font-black text-xs uppercase tracking-widest py-3 px-4 flex items-center gap-3 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                </DropdownMenuItem>
            </DropdownMenuContent>
            <ChangePasswordDialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
            />
        </DropdownMenu>
    );
}
