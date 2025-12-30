'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const memberSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    email: z.string().optional(),
    amountPaid: z.coerce.number().default(0),
});

const formSchema = z.object({
    tourName: z.string().min(2, "Name must be at least 2 characters."),
    description: z.string().min(5, "Description must be at least 5 characters."),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    currency: z.string().default('PKR'),
    totalBudget: z.coerce.number().default(0),
    status: z.enum(['planning', 'active', 'completed', 'cancelled']),
    members: z.array(memberSchema).default([]),
});

export function TourForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const defaultValues = initialData ? {
        ...initialData,
        startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
        endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
    } : {
        tourName: "",
        description: "",
        members: [],
        status: "planning",
        currency: "PKR",
        totalBudget: 0
    };

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const url = initialData ? `/api/tours/${initialData._id}` : '/api/tours';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (!res.ok) throw new Error('Failed');

            toast.success(initialData ? 'Tour updated' : 'Tour created');
            router.push('/');
            router.refresh();
        } catch (e) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                {/* Basic Info Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
                    <div className="space-y-1 px-1">
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">Trip Details</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">General information about the tour</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="tourName"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Tour Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Northern Areas Trip" className="rounded-2xl h-14 bg-zinc-50 border-zinc-100 px-6 font-bold text-lg shadow-inner focus-visible:ring-black" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="totalBudget"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Total Budget Est.</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="200000" className="rounded-2xl h-14 bg-zinc-50 border-zinc-100 px-6 font-bold text-lg shadow-inner focus-visible:ring-black" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-2xl h-14 bg-zinc-50 border-zinc-100 px-6 font-bold text-lg shadow-inner focus-visible:ring-black">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                            <SelectItem value="planning">Planning 📝</SelectItem>
                                            <SelectItem value="active">Active 🚀</SelectItem>
                                            <SelectItem value="completed">Completed ✅</SelectItem>
                                            <SelectItem value="cancelled">Cancelled ❌</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Currency</FormLabel>
                                    <FormControl>
                                        <Input disabled placeholder="PKR" className="rounded-2xl h-14 bg-zinc-100 border-zinc-100 px-6 font-bold text-lg shadow-inner" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell us about the adventure..." className="min-h-[120px] rounded-[2rem] bg-zinc-50 border-zinc-100 p-6 font-bold text-lg shadow-inner focus-visible:ring-black resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Members Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Trip Members</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Who's joining?</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full h-12 px-6 border-zinc-200 font-black text-black hover:bg-black hover:text-white transition-all shadow-sm"
                            onClick={() => append({ name: '', amountPaid: 0 })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Member
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="app-card border-none p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-black text-sm">
                                        {index + 1}
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="h-10 w-10 rounded-full text-zinc-300 hover:text-red-500 hover:bg-red-50">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`members.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Full Name" className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 px-5 font-bold shadow-inner focus-visible:ring-black" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`members.${index}.amountPaid`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Paid Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0.00" className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 px-5 font-bold shadow-inner focus-visible:ring-black" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <div className="app-card border-none py-12 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                                <Plus className="w-8 h-8 opacity-20" />
                                <p className="font-bold">No members added yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dates Section (Simplified for Mobile) */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("rounded-2xl h-12 bg-white border-zinc-100 px-5 font-bold w-full text-left", !field.value && "text-zinc-400")}>
                                                {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick Date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="font-black text-zinc-400 text-[10px] uppercase tracking-widest px-1">End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("rounded-2xl h-12 bg-white border-zinc-100 px-5 font-bold w-full text-left", !field.value && "text-zinc-400")}>
                                                {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick Date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-8">
                    <Button type="submit" disabled={loading} className="w-full h-16 rounded-[2rem] bg-black text-white text-xl font-black shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98]">
                        {loading ? 'Processing...' : initialData ? 'Update Trip' : 'Create Adventure 🚀'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
