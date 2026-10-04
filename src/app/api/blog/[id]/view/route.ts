import { ApiResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { incrementBlogViews } from "@/services/blogService";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await incrementBlogViews(id);

    if (!blog) {
      return ApiResponse.error(404, false, "Blog not found", null);
    }

    return ApiResponse.success(200, true, "Blog view incremented", { views: blog.views });
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to increment blog views", error.message);
  }
}
