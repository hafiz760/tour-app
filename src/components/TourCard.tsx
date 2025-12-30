import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// I did not explicitly install badge. I installed button, input, card, dialog, label, sonner, textarea, select, dropdown-menu, avatar, calendar, popover.
// I'll skip badge or use a simple span with classes.
import { CalendarDays, Users, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// Helper to format date
const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export function TourCard({ tour }: { tour: any }) {
    // tour type is any for now to avoid strict type duplication in client comp without shared types package
    // In real app, import ITour

    return (
        <Card className="app-card border-none hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-extrabold line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {tour.tourName}
                    </CardTitle>
                    <span className={cn(
                        "text-[10px] uppercase font-black px-2.5 py-1 rounded-full border shadow-sm",
                        tour.status === 'completed' ? 'bg-zinc-100 text-zinc-500 border-zinc-200' :
                            tour.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                    )}>
                        {tour.status}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                    {tour.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Members</span>
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                            <Users className="w-4 h-4 text-zinc-400" />
                            <span>{tour.members?.length || 0}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Spent</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-indigo-600">
                            <Wallet className="w-4 h-4" />
                            <span>{tour.currency} {tour.totalExpense?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500 font-semibold text-xs">
                        <CalendarDays className="w-4 h-4" />
                        <span>{tour.startDate ? formatDate(tour.startDate) : 'TBD'}</span>
                    </div>
                    <Link href={`/tour/${tour._id}`}>
                        <Button size="sm" className="rounded-full bg-black hover:bg-zinc-800 text-white font-bold h-9 px-5 shadow-lg active:scale-95 transition-all">
                            Details
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
