import { getUsers, createUser } from "@/services/authService";
import { ApiResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { withPermission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = withPermission("user", "read", async (req: NextRequest) => {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
        const startDate = searchParams.get("startDate") || "";
        const endDate = searchParams.get("endDate") || "";

        const result = await getUsers({
            page,
            limit,
            search,
            sortBy,
            sortOrder,
            startDate,
            endDate,
        });

        return ApiResponse.success(200, true, "Users fetched successfully", result);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to fetch users", error?.message || error);
    }
});

export const POST = withPermission("user", "create", async (req: NextRequest) => {
    try {
        await connectDB();
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return ApiResponse.error(400, false, "Name, email, and password are required", null);
        }

        const user = await createUser({
            name,
            email,
            password,
            role: role || "employee",
        });

        return ApiResponse.success(201, true, "User created successfully", {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        });
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to create user", error?.message || error);
    }
});
