import { ApiResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteBlog, getBlogById, updateBlog } from "@/services/blogServices";
import { NextRequest } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
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
};

export const PUT = async (req: NextRequest, { params }: RouteParams) => {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        if (!body.title || !body.content || !body.category) {
            return ApiResponse.error(400, false, "Title, content, and category are required", null);
        }

        const user = await getCurrentUser();
        if (!user) {
            return ApiResponse.error(401, false, "Unauthorized: Please log in to update a blog", null);
        }

        const existingBlog = await getBlogById(id);
        if (!existingBlog) {
            return ApiResponse.error(404, false, "Blog not found", null);
        }

        const authorId = existingBlog.author?._id?.toString() || existingBlog.author?.toString();
        if (authorId !== user.id && user.role !== "admin") {
            return ApiResponse.error(403, false, "Forbidden: You cannot update this blog", null);
        }

        const blog = await updateBlog(id, body);
        return ApiResponse.success(200, true, "Blog updated successfully", blog);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to update blog", error.message);
    }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
    try {
        await connectDB();
        const { id } = await params;

        const user = await getCurrentUser();
        if (!user) {
            return ApiResponse.error(401, false, "Unauthorized: Please log in to delete a blog", null);
        }

        const existingBlog = await getBlogById(id);
        if (!existingBlog) {
            return ApiResponse.error(404, false, "Blog not found", null);
        }

        const authorId = existingBlog.author?._id?.toString() || existingBlog.author?.toString();
        if (authorId !== user.id && user.role !== "admin") {
            return ApiResponse.error(403, false, "Forbidden: You cannot delete this blog", null);
        }

        const blog = await deleteBlog(id);
        return ApiResponse.success(200, true, "Blog deleted successfully", blog);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to delete blog", error.message);
    }
};
