import { TourForm } from '@/components/TourForm';

export default function NewTourPage() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-10 px-2">
                <h1 className="text-4xl font-black tracking-tighter text-black uppercase">Create Trip</h1>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">Plan your next adventure</p>
            </div>
            <TourForm />
        </div>
    )
}
