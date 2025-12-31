'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2 } from 'lucide-react';
import { updatePassword } from '@/actions/auth';
import { toast } from 'sonner';

interface ChangePasswordDialogProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ChangePasswordDialog({ children, open, onOpenChange }: ChangePasswordDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await updatePassword(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
                onOpenChange?.(false);
                (e.target as HTMLFormElement).reset();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/90 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                        <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-black uppercase tracking-tight">
                        Update Password
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium">
                        Enter your current password and a new secure password.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Current Password</Label>
                            <Input
                                name="currentPassword"
                                type="password"
                                required
                                className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-zinc-900 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">New Password</Label>
                            <Input
                                name="newPassword"
                                type="password"
                                required
                                className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-zinc-900 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Confirm New Password</Label>
                            <Input
                                name="confirmPassword"
                                type="password"
                                required
                                className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-zinc-900 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-zinc-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
