'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success("Account created! Please login.");
                router.push('/login');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Signup failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-sm border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="pt-10 pb-6 px-8 space-y-2">
                    <CardTitle className="text-4xl font-black tracking-tighter text-black uppercase">Sign Up</CardTitle>
                    <CardDescription className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Create an account to manage tours</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} method="POST">
                    <CardContent className="space-y-6 px-8 pb-8">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Full Name</Label>
                            <Input id="name" name="name" required placeholder="John Doe" className="h-12 bg-zinc-50 border-zinc-100 rounded-2xl px-5 font-bold focus:ring-2 focus:ring-black/5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Email Address</Label>
                            <Input id="email" name="email" type="email" required placeholder="name@example.com" className="h-12 bg-zinc-50 border-zinc-100 rounded-2xl px-5 font-bold focus:ring-2 focus:ring-black/5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="h-12 bg-zinc-50 border-zinc-100 rounded-2xl px-5 pr-12 font-bold focus:ring-2 focus:ring-black/5"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 px-8 pb-10">
                        <Button type="submit" className="w-full h-14 rounded-full bg-black text-white font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all" disabled={loading}>
                            {loading ? 'CREATING...' : 'SIGN UP'}
                        </Button>
                        <p className="text-center text-xs font-bold text-zinc-500 uppercase tracking-tight">
                            Already have an account? <Link href="/login" className="text-black underline underline-offset-4 hover:text-zinc-600 transition-colors">Login</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
