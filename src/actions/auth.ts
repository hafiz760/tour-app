'use server';

import { auth, signOut } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function handleLogout() {
    console.log("Logging out...");
    await signOut({ redirectTo: "/login" });
}

export async function updatePassword(formData: FormData) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return { error: "Not authenticated" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
    }

    if (newPassword.length < 6) {
        return { error: "Password must be at least 6 characters long" };
    }

    try {
        await connectDB();
        const user = await User.findById(session.user.id);

        if (!user) {
            return { error: "User not found" };
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password!);
        if (!isMatch) {
            return { error: "Incorrect current password" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordVersion = (user.passwordVersion || 0) + 1;
        await user.save();

        return { success: "Password updated successfully" };
    } catch (error) {
        console.error("Update password error:", error);
        return { error: "Failed to update password" };
    }
}
