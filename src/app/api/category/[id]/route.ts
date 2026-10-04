import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { categoryService } from "@/services/categoryService";
import { withPermission } from "@/lib/rbac";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withPermission("category", "read", async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return ApiResponse.error(404, false, "Category not found", null);
    }
    return ApiResponse.success(200, true, "Category fetched successfully", category);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to fetch category", error.message);
  }
});

export const PUT = withPermission("category", "update", async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const category = await categoryService.updateCategory(id, body);
    if (!category) {
      return ApiResponse.error(404, false, "Category not found", null);
    }
    return ApiResponse.success(200, true, "Category updated successfully", category);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to update category", error.message);
  }
});

export const DELETE = withPermission("category", "delete", async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await categoryService.deleteCategory(id);
    return ApiResponse.success(200, true, "Category deleted successfully", null);
  } catch (error: any) {
    return ApiResponse.error(500, false, "Failed to delete category", error.message);
  }
});
