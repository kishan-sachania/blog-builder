import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { blogService } from "@/services/blogService";
import { withPermission } from "@/lib/rbac";
import { isAdminRole } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function checkBlogOwnershipOrAdmin(existingBlog: any, user: any): boolean {
  const authorId = existingBlog.author?._id?.toString() || existingBlog.author?.toString();
  const currentUserId = user?.id || user?._id?.toString();
  return authorId === currentUserId || isAdminRole(user);
}

export const GET = withPermission("blog", "read", async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const blog = await blogService.getBlogById(id);

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
    const { id } = await params;
    const body = await req.json();

    const existingBlog = await blogService.getBlogById(id);
    if (!existingBlog) {
      return ApiResponse.error(404, false, "Blog not found", null);
    }

    if (!checkBlogOwnershipOrAdmin(existingBlog, user)) {
      return ApiResponse.error(403, false, "Forbidden: You cannot update this blog", null);
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.readTime !== undefined) updateData.readTime = body.readTime;
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.editorialNotes !== undefined) updateData.editorialNotes = body.editorialNotes;

    const blog = await blogService.updateBlog(id, updateData);
    return ApiResponse.success(200, true, "Blog updated successfully", blog);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to update blog", error.message);
  }
});

export const DELETE = withPermission("blog", "delete", async (_req: NextRequest, { params }: RouteParams, user: any) => {
  try {
    const { id } = await params;

    const existingBlog = await blogService.getBlogById(id);
    if (!existingBlog) {
      return ApiResponse.error(404, false, "Blog not found", null);
    }

    if (!checkBlogOwnershipOrAdmin(existingBlog, user)) {
      return ApiResponse.error(403, false, "Forbidden: You cannot delete this blog", null);
    }

    const blog = await blogService.deleteBlog(id);
    return ApiResponse.success(200, true, "Blog deleted successfully", blog);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to delete blog", error.message);
  }
});
