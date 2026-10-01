import { getUsers } from "@/services/authService";
import { ApiResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";


export const GET = async () => {
    try {
        await connectDB();
        const users = await getUsers();
        console.log(users);

        return NextResponse.json(users, {
            status: 200
        });
    } catch (error) {
        return NextResponse.json({
            error: "Failed to fetch users"
        }, {
            status: 500
        });
    }
}
