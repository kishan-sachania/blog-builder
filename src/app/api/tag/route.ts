import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { tagService } from "@/services/tagService";
import { withPermission } from "@/lib/rbac";

export const GET = withPermission("category", "read", async () => {
  try {
    const tags = await tagService.getAllTags();
    return ApiResponse.success(200, true, "Tags fetched successfully", tags);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to fetch tags", error.message);
  }
});

export const POST = withPermission("category", "create", async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (!body?.name?.trim()) {
      return ApiResponse.error(400, false, "Tag name is required", null);
    }
    const tag = await tagService.createTag(body);
    return ApiResponse.success(201, true, "Tag created successfully", tag);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to create tag", error.message);
  }
});
