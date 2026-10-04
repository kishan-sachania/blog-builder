import { getUserById, deleteUser, updateUser } from "@/services/authService";
import { ApiResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { withPermission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = withPermission("user", "read", async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        await connectDB();
        const { id } = await params;
        const user = await getUserById(id);
        if (!user) {
            return ApiResponse.error(404, false, "User not found", null);
        }
        return ApiResponse.success(200, true, "User fetched successfully", user);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to fetch user", error?.message || error);
    }
});

export const PUT = withPermission("user", "update", async (req: NextRequest, { params }: { params: Promise<{ id: string }> }, currentUser: any) => {
    try {
        await connectDB();
        const { id } = await params;
        const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();

        let roleName = "employee";
        if (typeof currentUser?.role === "string") {
            roleName = currentUser.role.toLowerCase();
        } else if (currentUser?.role && typeof currentUser.role === "object" && currentUser.role.name) {
            roleName = currentUser.role.name.toLowerCase();
        }

        const isAdmin =
            roleName === "admin" ||
            roleName === "administrator" ||
            roleName === "superadmin";

        // Non-admin employees can only update their own profile, not other users
        if (!isAdmin && currentUserId !== id) {
            return ApiResponse.error(403, false, "Forbidden: You can only update your own profile", null);
        }

        const body = await req.json();

        // Non-admin users cannot change their role
        if (!isAdmin && body.role) {
            delete body.role;
        }

        const updated = await updateUser(id, body);
        return ApiResponse.success(200, true, "User updated successfully", updated);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to update user", error?.message || error);
    }
});

export const DELETE = withPermission("user", "delete", async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        await connectDB();
        const { id } = await params;
        const deleted = await deleteUser(id);
        return ApiResponse.success(200, true, "User deleted successfully", deleted);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to delete user", error?.message || error);
    }
});
