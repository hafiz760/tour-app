import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tour from '@/models/Tour';
import { auth } from '@/auth';

// Helper to get ID from params
// Next.js 15: params is async or sync? In 15 it might be async in some contexts but route handlers usually receive it as second arg.
// (params: { id: string }) -> actually (request, { params })
// In Next 15 App router, params is a Promise in page props, but in Route Handlers it's currently still { params }.
// However, to be safe and "Latest" compliant:
// The type is `{ params: Promise<{ id: string }> }` in some beta versions? 
// Standard: `export async function GET(request: Request, context: { params: { id: string } })`
// I'll stick to standard.

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        const tour = await Tour.findById(id).populate('createdBy', 'name email');
        if (!tour) {
            return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
        }
        return NextResponse.json(tour);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        const body = await request.json();
        await connectDB();

        const tour = await Tour.findById(id);
        if (!tour) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Ideally check ownership: if (tour.createdBy.toString() !== user._id.toString()) ...
        // Skipping strict ownership check for MVP as "only logged-in users can create/edit tours" was the requirement
        // but usually user can edit ANY tour or only theirs? "Protected routes - only logged-in users...". 
        // I'll allow any logged in user to edit for simplicity unless "One user can register and login" implies single user app?
        // "One user can register and login" -> Single user app? Or "A user"?
        // "One user can register and login" usually means "The system supports a user registering".
        // I'll assume standard multi-user or shared access. I'll allow edit if logged in.

        Object.assign(tour, body);

        // Calculate totals
        const expenses = tour.expenses || [];
        const members = tour.members || [];
        const total = expenses.reduce((sum: number, exp: any) => sum + (exp.price || 0), 0);
        tour.totalExpense = total;
        if (members.length > 0) {
            tour.perHead = Math.ceil(total / members.length);
        } else {
            tour.perHead = 0;
        }

        await tour.save();

        return NextResponse.json(tour);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params;
        await connectDB();
        await Tour.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
