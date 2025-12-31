'use client';
import { forwardRef } from 'react';
import { cn } from "@/lib/utils"
import { format } from "date-fns";

export const ReportView = forwardRef(({ tour }: { tour: any }, ref: any) => {

    console.log(tour)
    const total = tour.expenses?.reduce((sum: number, exp: any) => sum + (exp.price || 0), 0) || 0;
    const budget = tour.totalBudget || 0;
    const balance = budget - total;
    const memberCount = tour.members?.length || 0;

    // Per Head Share based on TOTAL BUDGET (User's target)
    const perHeadTarget = memberCount > 0 ? Math.ceil(budget / memberCount) : 0;
    console.log(perHeadTarget)
    // Actual average spend per head (for reference)
    const perHeadActual = memberCount > 0 ? Math.ceil(total / memberCount) : 0;

    // Group expenses by category
    const byCategory: Record<string, number> = {};
    tour.expenses?.forEach((e: any) => {
        const cat = e.category || 'General';
        byCategory[cat] = (byCategory[cat] || 0) + (e.price || 0);
    });

    return (
        <div ref={ref} className="bg-white p-4 sm:p-10 max-w-4xl mx-auto min-h-screen">
            <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tighter uppercase">Trip Report</h1>
                    <p className="text-zinc-500 font-bold mt-1 text-[10px] sm:text-sm tracking-widest uppercase">{tour.tourName}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-zinc-400">Date Generated</p>
                    <p className="font-bold text-black">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="space-y-1 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Budget</p>
                    <p className="text-xl font-black text-black">{tour.currency} {budget.toLocaleString()}</p>
                </div>
                <div className="space-y-1 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Total Spent</p>
                    <p className="text-xl font-black text-indigo-600">{tour.currency} {total.toLocaleString()}</p>
                </div>
                <div className="space-y-1 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Remaining</p>
                    <p className={cn("text-xl font-black", balance >= 0 ? "text-green-600" : "text-red-600")}>
                        {tour.currency} {balance.toLocaleString()}
                    </p>
                </div>
                <div className="space-y-1 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Target/Head</p>
                    <p className="text-xl font-black text-black">{tour.currency} {perHeadTarget.toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-black border-l-4 border-black pl-4">Member Breakdown</h2>

                <div className="grid gap-4">
                    {tour.members?.map((m: any) => {
                        // SIMPLE MODEL: Total Contribution is just what they paid as a deposit
                        const amountPaid = m.amountPaid || 0;
                        const remainingPayable = perHeadTarget - amountPaid;

                        return (
                            <div key={m._id || m.name} className="p-6 rounded-3xl border-2 border-zinc-100 bg-white hover:border-black transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-black">
                                            {m.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="font-black text-lg text-black">{m.name}</div>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-sm",
                                        remainingPayable > 0 ? 'bg-red-50 text-red-600' :
                                            'bg-green-50 text-green-600'
                                    )}>
                                        {remainingPayable > 0 ? `To Pay: ${tour.currency} ${remainingPayable.toLocaleString()}` :
                                            remainingPayable < 0 ? `Overpaid: ${tour.currency} ${Math.abs(remainingPayable).toLocaleString()}` : 'Settled ✅'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-zinc-200">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-zinc-400">Total Paid</p>
                                        <p className="text-xl font-black text-indigo-600">{tour.currency} {amountPaid.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-black uppercase text-zinc-400">Target Share</p>
                                        <p className="font-bold text-zinc-900">{tour.currency} {perHeadTarget.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-black rounded-full" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-black">Expenses Log</h2>
                </div>

                {/* Desktop/Print Table View */}
                <div className="hidden sm:block border-2 border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#18181b] text-white">
                                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Date</th>
                                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Description</th>
                                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Category</th>
                                <th className="p-6 text-right text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {tour.expenses?.map((exp: any, i: number) => (
                                <tr key={i} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="p-6 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-black text-zinc-400 leading-tight">
                                                {exp.date ? format(new Date(exp.date), 'MMM d,') : '-'}
                                            </span>
                                            <span className="text-[13px] font-black text-zinc-400 leading-tight">
                                                {exp.date ? format(new Date(exp.date), 'yyyy') : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <div className="text-lg font-black text-black leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                            {exp.name}
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <span className="inline-flex px-4 py-1.5 bg-[#f4f4f5] rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right align-top">
                                        <div className="text-lg font-black text-black">
                                            {tour.currency} {exp.price?.toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile-Only Card View */}
                <div className="block sm:hidden space-y-4">
                    {tour.expenses?.map((exp: any, i: number) => (
                        <div key={i} className="p-5 rounded-3xl border-2 border-zinc-100 bg-white space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">
                                        {exp.date ? format(new Date(exp.date), 'MMM d, yyyy') : '-'}
                                    </span>
                                    <h4 className="text-lg font-black text-black leading-tight uppercase tracking-tight">{exp.name}</h4>
                                </div>
                                <span className="px-3 py-1 bg-[#f4f4f5] rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                    {exp.category}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-dashed border-zinc-100 flex justify-between items-end">
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Amount</span>
                                <span className="text-xl font-black text-black">{tour.currency} {exp.price?.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Footer (Responsive) */}
                <div className="p-8 sm:p-12 rounded-[2.5rem] bg-zinc-900 text-white flex flex-col items-center sm:items-end justify-center gap-2 shadow-2xl">
                    <span className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Total Trip Spent</span>
                    <div className="text-4xl sm:text-6xl font-black tracking-tighter text-white">
                        {tour.currency} {total.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 px-1">Category Breakdown</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(byCategory).map(([cat, amount]) => (
                        <div key={cat} className="p-4 rounded-2xl border border-zinc-100 bg-white">
                            <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">{cat}</p>
                            <p className="font-black text-black">{tour.currency} {amount.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 pt-8 border-t text-center text-slate-400 text-sm">
                Generated by Zash Management
            </div>
        </div>
    );
});
ReportView.displayName = 'ReportView';
