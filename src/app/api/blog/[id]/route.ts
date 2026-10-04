import { ApiResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteBlog, getBlogById, updateBlog } from "@/services/blogServices";
import { NextRequest } from "next/server";
import { withPermission } from "@/lib/rbac";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const GET = withPermission("blog", "read", async (_req: NextRequest, { params }: RouteParams) => {
    try {
        await connectDB();
        const { id } = await params;
        const blog = await getBlogById(id);

        if (!blog) {
            return ApiResponse.error(404, false, "Blog not found", null);
        }

        return ApiResponse.success(200, true, "Blog fetched successfully", blog);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to fetch blog", error.message);
    }
});

export const PUT = withPermission("blog", "update", async (req: NextRequest, { params }: RouteParams, user: any) => {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const currentUser = user || (await getCurrentUser());
        if (!currentUser) {
            return ApiResponse.error(401, false, "Unauthorized: Please log in to update a blog", null);
        }

        const existingBlog = await getBlogById(id);
        if (!existingBlog) {
            return ApiResponse.error(404, false, "Blog not found", null);
        }

        const authorId = existingBlog.author?._id?.toString() || existingBlog.author?.toString();
        const currentUserId = currentUser.id || currentUser._id?.toString();

        let roleName = 'employee';
        if (typeof currentUser.role === 'string') {
            roleName = currentUser.role.toLowerCase();
        } else if (currentUser.role && typeof currentUser.role === 'object' && currentUser.role.name) {
            roleName = currentUser.role.name.toLowerCase();
        } else if (currentUser.roleName) {
            roleName = currentUser.roleName.toLowerCase();
        }

        const isAdmin =
            roleName === 'admin' ||
            roleName === 'administrator' ||
            roleName === 'superadmin';

        if (authorId !== currentUserId && !isAdmin) {
            return ApiResponse.error(403, false, "Forbidden: You cannot update this blog", null);
        }

        const updateData: any = {};
        if (body.title !== undefined) {
            if (!body.title.trim()) {
                return ApiResponse.error(400, false, "Title cannot be empty", null);
            }
            updateData.title = body.title.trim();
        }
        if (body.content !== undefined) {
            if (!body.content.trim()) {
                return ApiResponse.error(400, false, "Content cannot be empty", null);
            }
            updateData.content = body.content;
        }
        if (body.category !== undefined) {
            if (!body.category) {
                return ApiResponse.error(400, false, "Category is required", null);
            }
            updateData.category = body.category;
        }
        if (body.status !== undefined) {
            updateData.status = body.status === "published" ? "published" : "draft";
        }
        if (body.coverImage !== undefined) {
            updateData.coverImage = body.coverImage;
        }
        if (body.tags !== undefined) {
            updateData.tags = body.tags;
        }

        const blog = await updateBlog(id, updateData);
        return ApiResponse.success(200, true, "Blog updated successfully", blog);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to update blog", error.message);
    }
});

export const DELETE = withPermission("blog", "delete", async (_req: NextRequest, { params }: RouteParams, user: any) => {
    try {
        await connectDB();
        const { id } = await params;

        const currentUser = user || (await getCurrentUser());
        if (!currentUser) {
            return ApiResponse.error(401, false, "Unauthorized: Please log in to delete a blog", null);
        }

        const existingBlog = await getBlogById(id);
        if (!existingBlog) {
            return ApiResponse.error(404, false, "Blog not found", null);
        }

        const authorId = existingBlog.author?._id?.toString() || existingBlog.author?.toString();
        const currentUserId = currentUser.id || currentUser._id?.toString();

        let roleName = 'employee';
        if (typeof currentUser.role === 'string') {
            roleName = currentUser.role.toLowerCase();
        } else if (currentUser.role && typeof currentUser.role === 'object' && currentUser.role.name) {
            roleName = currentUser.role.name.toLowerCase();
        } else if (currentUser.roleName) {
            roleName = currentUser.roleName.toLowerCase();
        }

        const isAdmin =
            roleName === 'admin' ||
            roleName === 'administrator' ||
            roleName === 'superadmin';

        if (authorId !== currentUserId && !isAdmin) {
            return ApiResponse.error(403, false, "Forbidden: You cannot delete this blog", null);
        }

        const blog = await deleteBlog(id);
        return ApiResponse.success(200, true, "Blog deleted successfully", blog);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to delete blog", error.message);
    }
});
