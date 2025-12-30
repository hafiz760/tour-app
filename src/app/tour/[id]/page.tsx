import connectDB from '@/lib/db';
import Tour from '@/models/Tour';
import { TourDetails } from '@/components/TourDetails';
import { notFound } from 'next/navigation';

export default async function TourPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const tour = await Tour.findById(id).lean();
    if (!tour) return notFound();
    const serialize = (obj: any): any => JSON.parse(JSON.stringify(obj));

    return (
        <div className="max-w-5xl mx-auto">
            <TourDetails tour={serialize(tour)} />
        </div>
    )
}
