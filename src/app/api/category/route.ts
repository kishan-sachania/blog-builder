import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { categoryService } from "@/services/categoryService";
import { withPermission } from "@/lib/rbac";

export const GET = withPermission("category", "read", async () => {
  try {
    const categories = await categoryService.getAllCategories();
    return ApiResponse.success(200, true, "Categories fetched successfully", categories);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to fetch categories", error.message);
  }
});

export const POST = withPermission("category", "create", async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (!body?.name?.trim()) {
      return ApiResponse.error(400, false, "Category name is required", null);
    }
    const category = await categoryService.createCategory(body);
    return ApiResponse.success(201, true, "Category created successfully", category);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to create category", error.message);
  }
});
