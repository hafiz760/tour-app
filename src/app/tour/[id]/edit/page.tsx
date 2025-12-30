import connectDB from '@/lib/db';
import Tour from '@/models/Tour';
import { TourForm } from '@/components/TourForm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect('/login');

    const { id } = await params;
    await connectDB();
    const tour = await Tour.findById(id).lean();

    if (!tour) return notFound();

    const serialize = (obj: any): any => JSON.parse(JSON.stringify(obj));

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-10 px-2">
                <h1 className="text-4xl font-black tracking-tighter text-black uppercase">Edit Trip</h1>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">Modify your adventure details</p>
            </div>
            <TourForm initialData={serialize(tour)} />
        </div>
    )
}
