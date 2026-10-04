import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ApiResponse } from "@/lib/api-response";
import { User } from "../../models/user";
import { Role } from "../../models/role";
import { Permission } from "../../models/permission";
import { getRole } from "@/services/roleServices";
import { TokenServices } from "@/services/tokenServices";

void Role;
void Permission;

export type Action = "create" | "read" | "update" | "delete";

export type RouteHandler = (
  req: NextRequest,
  ctx: any,
  user: any
) => Promise<Response> | Response;

/**
 * Checks if a user has a specific permission or role privileges.
 */
export function hasPermission(
  user: any,
  resourceOrPermission: string,
  action?: Action | string
): boolean {
  if (!user) return false;

  let targetResource = resourceOrPermission;
  let targetAction = action;

  if (!targetAction && resourceOrPermission.includes(":")) {
    const parts = resourceOrPermission.split(":");
    targetResource = parts[0];
    targetAction = parts[1];
  }

  let roleName = "employee";
  if (typeof user.role === "string") {
    roleName = user.role.toLowerCase();
  } else if (user.role && typeof user.role === "object" && user.role.name) {
    roleName = user.role.name.toLowerCase();
  } else if (user.roleName) {
    roleName = user.roleName.toLowerCase();
  }

  // Admin users bypass and have full access
  if (
    roleName === "admin" ||
    roleName === "administrator" ||
    roleName === "superadmin"
  ) {
    return true;
  }

  const permissions: any[] =
    user.role && typeof user.role === "object" && Array.isArray(user.role.permissions)
      ? user.role.permissions
      : Array.isArray(user.permissions)
      ? user.permissions
      : [];

  return permissions.some((perm) => {
    if (!perm) return false;
    if (typeof perm === "string") {
      return (
        perm === `${targetResource}:${targetAction}` ||
        perm === `${targetResource}:*` ||
        perm === "*:*" ||
        perm === "*"
      );
    }
    const pResource = perm.resource;
    const pAction = perm.action;
    const pName = perm.name;

    if (pResource === "*" && pAction === "*") return true;
    if (pResource === targetResource && (pAction === targetAction || pAction === "*")) return true;
    if (pName && targetAction && pName === `${targetResource}:${targetAction}`) return true;
    if (pName && pName === targetResource) return true;

    return false;
  });
}

/**
 * Route middleware wrapper that verifies JWT identity and dynamically authorizes
 * based on current user role and permissions from MongoDB.
 */
export function withPermission(
  resource: string,
  action: Action,
  handler: RouteHandler
) {
  return async (req: NextRequest, ctx?: any): Promise<Response> => {
    try {
      let token: string | undefined;

      const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }

      if (!token) {
        if (req.cookies && typeof req.cookies.get === "function") {
          token = req.cookies.get("accessToken")?.value || req.cookies.get("token")?.value;
        }
      }

      if (!token) {
        const cookieHeader = req.headers.get("cookie") || "";
        const cookies = cookieHeader.split(";").map((c) => c.trim());
        const tokenCookie = cookies.find((c) => c.startsWith("accessToken=") || c.startsWith("token="));
        if (tokenCookie) {
          token = tokenCookie.split("=")[1];
        }
      }

      if (!token) {
        return ApiResponse.error(401, false, "Unauthorized: Token missing", null);
      }

      let decoded: any;
      try {
        decoded = TokenServices.verifyAccessToken(token);
      } catch {
        return ApiResponse.error(401, false, "Unauthorized: Invalid or expired token", null);
      }

      const userId = decoded?.userId || decoded?.id;
      const tokenVersion = decoded?.tokenVersion;

      if (!userId) {
        return ApiResponse.error(401, false, "Unauthorized: Invalid token payload", null);
      }

      await connectDB();

      void Role;
      void Permission;

      // Fetch user from MongoDB with populated role & permissions
      const user = await User.findById(userId).populate({
        path: "role",
        populate: {
          path: "permissions",
        },
      });

      if (!user) {
        return ApiResponse.error(401, false, "Unauthorized: User not found or deactivated", null);
      }

      // Check for unpopulated/missing role structure and resolve dynamically if needed
      if (!user.role || typeof user.role === "string" || !(user.role as any).permissions) {
        const roleDoc = await getRole(typeof user.role === "string" ? user.role : "employee");
        if (roleDoc) {
          user.role = roleDoc;
        }
      }

      // Invalidate session if token version has changed
      if (tokenVersion !== undefined && user.tokenVersion !== undefined && user.tokenVersion !== tokenVersion) {
        return ApiResponse.error(401, false, "Unauthorized: Token version mismatch / session revoked", null);
      }

      // Authorize against current database permissions
      if (!hasPermission(user, resource, action)) {
        return ApiResponse.error(403, false, `Forbidden: Insufficient permissions for ${resource}:${action}`, null);
      }

      return await handler(req, ctx, user);
    } catch (error: any) {
      return ApiResponse.error(500, false, "Internal Server Error", error.message);
    }
  };
}
