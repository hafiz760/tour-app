import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tour from '@/models/Tour';
import { auth } from '@/auth';

export async function GET() {
    try {
        await connectDB();
        // Sort by createdAt desc
        const tours = await Tour.find({}).sort({ createdAt: -1 });
        return NextResponse.json(tours);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log(body);
        await connectDB();
        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const newTour = await Tour.create({
            ...body,
            createdBy: user._id,
        });

        return NextResponse.json(newTour, { status: 201 });
    } catch (error) {
        console.error('Create tour error:', error);
        return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 });
    }
}
