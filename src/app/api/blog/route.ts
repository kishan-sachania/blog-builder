import { ApiResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db"
import { createBlog, getBlogs } from "@/services/blogServices";
import { NextRequest } from "next/server";

export const GET = async () => {
    try {
        await connectDB();
        const blogs = await getBlogs();
        return ApiResponse.success(200, true, "Blogs fetched successfully", blogs);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to fetch blogs", error.message);
    }
}


export const POST = async (req: NextRequest) => {
    try {
        await connectDB()
        const body = await req.json();
        if (!body.title || !body.content || !body.category) {
            return ApiResponse.error(400, false, "Title and content are required", "");
        }
        const user = await getCurrentUser();
        if (!user) {
            return ApiResponse.error(401, false, "Unauthorized: Please log in to create a blog", "");
        }
        const blog = await createBlog({ ...body, author: user.id });
        return ApiResponse.success(200, true, "Blog created successfully", blog);
    } catch (error: any) {
        return ApiResponse.error(500, false, "Failed to create blog", error.message);
    }
}