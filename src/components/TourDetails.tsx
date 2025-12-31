'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2, Printer, Plus, Pencil } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useReactToPrint } from 'react-to-print';
import { ReportView } from './ReportView';
import { toast } from 'sonner';

export function TourDetails({ tour }: { tour: any }) {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(null);
    const [defaultExpenseValues, setDefaultExpenseValues] = useState<any>(null);

    // Dynamic total calculation for consistency
    const totalSpent = tour.expenses?.reduce((sum: number, exp: any) => sum + (exp.price || 0), 0) || 0;
    const remainingBalance = tour.totalBudget - totalSpent;
    const progressPercentage = Math.round((remainingBalance / tour.totalBudget) * 100);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        const newExpense = {
            name: data.name,
            price: Number(data.price),
            category: data.category,
            paidBy: data.paidBy || 'Pool',
            date: editingExpenseIndex !== null ? tour.expenses[editingExpenseIndex].date : new Date(),
        };

        let updatedExpenses = [...(tour.expenses || [])];
        let updatedMembers = [...(tour.members || [])];

        if (editingExpenseIndex !== null) {
            // EDIT MODE
            const oldExpense = tour.expenses[editingExpenseIndex];

            // 1. Revert old payment effect
            if (oldExpense.paidBy && oldExpense.paidBy !== 'Pool') {
                const oldMemberIndex = updatedMembers.findIndex((m: any) => m.name === oldExpense.paidBy);
                if (oldMemberIndex !== -1) {
                    updatedMembers[oldMemberIndex] = {
                        ...updatedMembers[oldMemberIndex],
                        amountPaid: (updatedMembers[oldMemberIndex].amountPaid || 0) - oldExpense.price
                    };
                }
            }

            // 2. Apply new payment effect
            if (newExpense.paidBy && newExpense.paidBy !== 'Pool') {
                const newMemberIndex = updatedMembers.findIndex((m: any) => m.name === newExpense.paidBy);
                if (newMemberIndex !== -1) {
                    updatedMembers[newMemberIndex] = {
                        ...updatedMembers[newMemberIndex],
                        amountPaid: (updatedMembers[newMemberIndex].amountPaid || 0) + newExpense.price
                    };
                }
            }

            updatedExpenses[editingExpenseIndex] = newExpense;

        } else {
            // ADD MODE
            if (newExpense.paidBy && newExpense.paidBy !== 'Pool') {
                const memberIndex = updatedMembers.findIndex((m: any) => m.name === newExpense.paidBy);
                if (memberIndex !== -1) {
                    updatedMembers[memberIndex] = {
                        ...updatedMembers[memberIndex],
                        amountPaid: (updatedMembers[memberIndex].amountPaid || 0) + newExpense.price
                    };
                }
            }
            updatedExpenses.push(newExpense);
        }

        try {
            const res = await fetch(`/api/tours/${tour._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expenses: updatedExpenses,
                    members: updatedMembers
                })
            });
            if (res.ok) {
                toast.success(editingExpenseIndex !== null ? 'Expense Updated' : 'Expense Added');
                setExpenseOpen(false);
                setEditingExpenseIndex(null);
                setDefaultExpenseValues(null);
                router.refresh();
            } else {
                toast.error('Failed to save expense');
            }
        } catch (e) {
            toast.error('Error saving expense');
        } finally {
            setLoading(false);
        }
    };

    const handleEditExpense = (index: number) => {
        const expenseToEdit = tour.expenses[(tour.expenses?.length || 0) - 1 - index];
        const originalIndex = (tour.expenses?.length || 0) - 1 - index;

        setEditingExpenseIndex(originalIndex);
        setDefaultExpenseValues(expenseToEdit);
        setExpenseOpen(true);
    }

    const handleOpenChange = (open: boolean) => {
        setExpenseOpen(open);
        if (!open) {
            setEditingExpenseIndex(null);
            setDefaultExpenseValues(null);
        }
    }

    const handleDeleteExpense = async (index: number) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        const realIndex = (tour.expenses?.length || 0) - 1 - index;
        const expenseToDelete = tour.expenses[realIndex];

        // Remove expense
        const updatedExpenses = tour.expenses.filter((_: any, i: number) => i !== realIndex);

        // Revert member balance if needed
        let updatedMembers = [...(tour.members || [])];
        if (expenseToDelete.paidBy && expenseToDelete.paidBy !== 'Pool') {
            const memberIndex = updatedMembers.findIndex((m: any) => m.name === expenseToDelete.paidBy);
            if (memberIndex !== -1) {
                updatedMembers[memberIndex] = {
                    ...updatedMembers[memberIndex],
                    amountPaid: (updatedMembers[memberIndex].amountPaid || 0) - expenseToDelete.price
                };
            }
        }

        try {
            const res = await fetch(`/api/tours/${tour._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expenses: updatedExpenses,
                    members: updatedMembers
                })
            });
            if (res.ok) {
                toast.success('Expense Deleted');
                router.refresh();
            }
        } catch (e) { toast.error('Error deleting expense'); }
    }

    const handleDeleteTour = async () => {
        if (!confirm('Are you sure you want to delete this entire tour? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/tours/${tour._id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Tour deleted successfully');
                router.push('/');
                router.refresh();
            } else {
                toast.error('Failed to delete tour');
            }
        } catch (e) {
            toast.error('Error deleting tour');
        }
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header Section - Refined for Mobile */}
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-black/5">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight">{tour.tourName}</h1>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                    tour.status === 'active' ? 'bg-black text-white border-black' :
                                        'bg-zinc-100 text-zinc-400 border-zinc-200'
                                )}>
                                    {tour.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="icon" variant="outline" onClick={() => router.push(`/tour/${tour._id}/edit`)} className="rounded-full h-10 w-10 border-zinc-200">
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={handleDeleteTour} className="rounded-full h-10 w-10 bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-zinc-50 rounded-2xl border border-black/[0.03]">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Budget</p>
                            <p className="text-lg font-bold text-zinc-900">{tour.currency} {tour.totalBudget?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Spent</p>
                            <p className="text-lg font-bold text-indigo-600">{tour.currency} {totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2 space-y-2 pt-2 border-t border-zinc-200 lg:border-t-0 lg:pt-0">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Balance</p>
                                <p className={cn("text-xs font-bold", remainingBalance >= 0 ? "text-green-600" : "text-red-600")}>
                                    {progressPercentage}% Left
                                </p>
                            </div>
                            <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000", remainingBalance >= 0 ? "bg-green-500" : "bg-red-500")}
                                    style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-around bg-white p-1 rounded-2xl border border-black/5 shadow-sm mb-6">
                    <TabsTrigger value="overview" className="flex-1 rounded-xl data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all py-2.5">Overview</TabsTrigger>
                    <TabsTrigger value="expenses" className="flex-1 rounded-xl data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all py-2.5">Expenses</TabsTrigger>
                    <TabsTrigger value="report" className="flex-1 rounded-xl data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all py-2.5">Report</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="space-y-4">
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3 px-1">Description</h3>
                            <Card className="app-card border-none p-5">
                                <p className="text-zinc-600 font-medium leading-relaxed">{tour.description}</p>
                            </Card>
                        </section>

                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3 px-1">Members ({tour.members?.length || 0})</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {tour.members?.map((m: any, i: number) => (
                                    <div key={i} className="app-card border-none flex items-center gap-4 p-4">
                                        <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-lg shadow-inner">
                                            {m.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden space-y-0.5">
                                            <div className="font-bold text-zinc-900 truncate">{m.name}</div>
                                            <div className="text-xs text-zinc-400 font-bold truncate tracking-tight">{m.phone || m.email || 'No contact info'}</div>
                                            <div className="text-xs text-indigo-500 font-bold truncate tracking-tight">Paid: {tour.currency} {m.amountPaid?.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4 mt-0">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Expenses Log</h3>
                        <Dialog open={expenseOpen} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="rounded-full bg-black hover:bg-zinc-800 text-white font-black h-11 px-6 shadow-xl active:scale-95 transition-all border-2 border-white/10">
                                    <Plus className="w-5 h-5 mr-2" /> Add Expense
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-white rounded-[2rem] border-none shadow-2xl p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-zinc-900">
                                        {editingExpenseIndex !== null ? 'Edit Expense' : 'Add Expense'}
                                    </DialogTitle>
                                    <DialogDescription className="font-medium text-zinc-400">
                                        {editingExpenseIndex !== null ? 'Update the details of this expense.' : 'Log a new trip expense here.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddExpense} className="space-y-5 mt-6" key={editingExpenseIndex !== null ? 'edit' : 'add'}>
                                    <div className="grid gap-2">
                                        <Label className="font-bold text-zinc-600 px-1">What was it for?</Label>
                                        <Input
                                            name="name"
                                            required
                                            placeholder="Dinner at Monal..."
                                            className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 px-5 font-bold"
                                            defaultValue={defaultExpenseValues?.name}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="font-bold text-zinc-600 px-1">Amount</Label>
                                            <Input
                                                name="price"
                                                type="number"
                                                required
                                                placeholder="0.00"
                                                className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 px-5 font-bold"
                                                defaultValue={defaultExpenseValues?.price}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="font-bold text-zinc-600 px-1">Category</Label>
                                            <Select name="category" defaultValue={defaultExpenseValues?.category || "Food"}>
                                                <SelectTrigger className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 px-5 font-bold"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                                    <SelectItem value="Food">Food 🍔</SelectItem>
                                                    <SelectItem value="Transport">Transport 🚗</SelectItem>
                                                    <SelectItem value="Accommodation">Hotel 🏨</SelectItem>
                                                    <SelectItem value="Misc">Other ✨</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="font-bold text-zinc-600 px-1">Paid By (Optional)</Label>
                                        <Select name="paidBy" defaultValue={defaultExpenseValues?.paidBy || "Pool"}>
                                            <SelectTrigger className="rounded-2xl h-12 bg-zinc-50 border-zinc-100 px-5 font-bold">
                                                <SelectValue placeholder="Select Payer" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-xl">
                                                <SelectItem value="Pool">Common Pool 🏊‍♂️</SelectItem>
                                                {tour.members?.map((m: any) => (
                                                    <SelectItem key={m._id || m.name} value={m.name}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button type="submit" className="w-full bg-black text-white hover:bg-zinc-800 rounded-2xl h-14 font-black text-lg mt-4 shadow-xl active:scale-[0.98] transition-all" disabled={loading}>
                                        {loading ? 'Saving...' : (editingExpenseIndex !== null ? 'Update Expense' : 'Save Expense')}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4">
                        {(tour.expenses?.length || 0) === 0 && (
                            <div className="app-card border-none py-12 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                                <Plus className="w-8 h-8 opacity-20" />
                                <p className="font-bold">No expenses logged yet</p>
                            </div>
                        )}
                        {tour.expenses?.slice().reverse().map((exp: any, i: number) => (
                            <div key={i} className="app-card border-none p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-zinc-50 flex items-center justify-center shadow-inner group-hover:bg-indigo-50 transition-colors">
                                        <span className="text-xl">
                                            {exp.category === 'Food' ? '🍔' :
                                                exp.category === 'Transport' ? '🚗' :
                                                    exp.category === 'Accommodation' ? '🏨' : '✨'}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-zinc-900 truncate">{exp.name}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-tighter">
                                            <span>{exp.date ? format(new Date(exp.date), 'MMM d') : '-'}</span>
                                            {exp.paidBy && exp.paidBy !== 'Pool' && (
                                                <span className="text-indigo-500">• Paid by {exp.paidBy}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="font-black text-zinc-900">{tour.currency} {exp.price.toLocaleString()}</div>
                                    </div>
                                    <Button
                                        size="icon"
                                        className="h-9 w-9 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                        onClick={() => handleEditExpense(i)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        size="icon"
                                        className="h-9 w-9 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                                        onClick={() => handleDeleteExpense(i)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="report" className="mt-0 space-y-4">
                    <div className="app-card border-none bg-black p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                        <div className="relative">
                            <h3 className="font-black text-2xl tracking-tight">Full Summary</h3>
                            <p className="text-zinc-400 font-medium mt-1">Download or share the PDF report for this tour.</p>
                        </div>
                        <Button onClick={() => handlePrint && handlePrint()} className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-black font-black h-14 px-8 rounded-2xl shadow-xl transition-all active:scale-95 relative">
                            <Printer className="mr-2 h-5 w-5" /> Export PDF
                        </Button>
                    </div>

                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/5">
                        <ReportView tour={tour} ref={componentRef} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
