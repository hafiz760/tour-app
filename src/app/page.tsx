import connectDB from '@/lib/db';
import Tour from '@/models/Tour';
import { TourCard } from '@/components/TourCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function Home() {
  await connectDB();
  const tours = await Tour.find({}).sort({ createdAt: -1 });

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase">
            Dashboard
          </h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">Manage your adventures</p>
        </div>
        <Link href="/tour/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-14 rounded-2xl bg-black text-white px-8 font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all">
            <Plus className="w-5 h-5 mr-3" /> New Trip
          </Button>
        </Link>
      </div>

      {tours.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[3rem] border-2 border-dashed border-zinc-100 bg-white/50 backdrop-blur-sm p-12 text-center space-y-6">
          <div className="h-20 w-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center">
            <Plus className="w-10 h-10 text-black/10" />
          </div>
          <div className="space-y-2 max-w-xs">
            <h3 className="text-xl font-black text-zinc-900">No trips yet</h3>
            <p className="text-zinc-500 font-medium">Ready to start a new adventure? Create your first trip manager now.</p>
          </div>
          <Link href="/tour/new">
            <Button className="h-12 rounded-full bg-black text-white px-8 font-bold">
              Start Planning
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map(tour => (
            <TourCard key={tour._id.toString()} tour={JSON.parse(JSON.stringify(tour))} />
          ))}
        </div>
      )}
    </div>
  )
}
