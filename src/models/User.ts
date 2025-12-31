import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    email: string;
    password?: string;
    name: string;
    passwordVersion: number;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    passwordVersion: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite during hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
