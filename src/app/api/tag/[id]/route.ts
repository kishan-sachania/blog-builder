import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { tagService } from "@/services/tagService";
import { withPermission } from "@/lib/rbac";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withPermission("tag", "read", async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const tag = await tagService.getTagById(id);
    if (!tag) {
      return ApiResponse.error(404, false, "Tag not found", null);
    }
    return ApiResponse.success(200, true, "Tag fetched successfully", tag);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to fetch tag", error.message);
  }
});

export const PUT = withPermission("tag", "update", async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const tag = await tagService.updateTag(id, body);
    if (!tag) {
      return ApiResponse.error(404, false, "Tag not found", null);
    }
    return ApiResponse.success(200, true, "Tag updated successfully", tag);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to update tag", error.message);
  }
});

export const DELETE = withPermission("tag", "delete", async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await tagService.deleteTag(id);
    return ApiResponse.success(200, true, "Tag deleted successfully", null);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to delete tag", error.message);
  }
});
