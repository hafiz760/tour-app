'use server';

import { signOut } from "@/auth";

export async function handleLogout() {
    console.log("Logging out...");
    await signOut({ redirectTo: "/login" });
}
