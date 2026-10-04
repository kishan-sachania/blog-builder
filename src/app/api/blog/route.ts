import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { blogService } from "@/services/blogService";
import { withPermission } from "@/lib/rbac";

export const GET = withPermission("blog", "read", async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const author = searchParams.get("author") || undefined;

    const blogs = await blogService.getBlogs({ page, limit, status, search, category, author });
    return ApiResponse.success(200, true, "Blogs fetched successfully", blogs);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to fetch blogs", error.message);
  }
});

export const POST = withPermission("blog", "create", async (req: NextRequest, _ctx: any, user: any) => {
  try {
    const body = await req.json();
    if (!body.title?.trim() || !body.content?.trim() || !body.category) {
      return ApiResponse.error(400, false, "Title, content, and category are required", null);
    }
    const authorId = user?.id || user?._id?.toString();
    const blog = await blogService.createBlog({ ...body, author: authorId });
    return ApiResponse.success(201, true, "Blog created successfully", blog);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to create blog", error.message);
  }
});