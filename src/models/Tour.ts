import mongoose, { Schema, Model, Types } from 'mongoose';

export enum TourStatus {
    PLANNING = 'planning',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface IMember {
    name: string;
    phone?: string;
    email?: string;
    paid: boolean;
    amountPaid: number;
}

export interface IExpense {
    name: string;
    price: number;
    description?: string;
    category: string;
    paidBy?: string; // Member name or 'Admin'
    date: Date;
    receiptUrl?: string;
}

export interface ITour {
    _id?: Types.ObjectId;
    tourName: string;
    description: string;
    destinations: string[];
    members: IMember[];
    expenses: IExpense[];
    perHead: number;
    totalExpense: number;
    startDate?: Date;
    endDate?: Date;
    status: TourStatus;
    currency: string;
    totalBudget: number;
    imageUrl?: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MemberSchema = new Schema<IMember>({
    name: { type: String, required: true },
    phone: String,
    email: String,
    paid: { type: Boolean, default: false },
    amountPaid: { type: Number, default: 0 },
});

const ExpenseSchema = new Schema<IExpense>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: { type: String, default: 'General' },
    paidBy: String,
    date: { type: Date, default: Date.now },
    receiptUrl: String,
});

const TourSchema = new Schema<ITour>(
    {
        tourName: { type: String, required: true },
        description: { type: String, required: true },
        destinations: [String],
        members: [MemberSchema],
        expenses: [ExpenseSchema],
        perHead: { type: Number, default: 0 },
        totalExpense: { type: Number, default: 0 },
        totalBudget: { type: Number, default: 0 },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: Object.values(TourStatus),
            default: TourStatus.PLANNING,
        },
        currency: { type: String, default: 'PKR' },
        imageUrl: String,
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);


const Tour: Model<ITour> = mongoose.models.Tour || mongoose.model<ITour>('Tour', TourSchema);

export default Tour;
