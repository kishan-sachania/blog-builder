import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ApiResponse } from '@/lib/api-response';
import { User } from '@/models';
import { getRole } from '@/services/roleService';
import { verifyAccessToken } from '@/services/tokenService';
import { getRoleName, isAdminRole } from '@/lib/auth';

export type Action = 'create' | 'read' | 'update' | 'delete';

export type RouteHandler = (
  req: NextRequest,
  ctx: any,
  user: any
) => Promise<Response> | Response;

export const permissionsToSeed = [
  { name: 'blog:create', resource: 'blog', action: 'create' },
  { name: 'blog:read', resource: 'blog', action: 'read' },
  { name: 'blog:update', resource: 'blog', action: 'update' },
  { name: 'blog:delete', resource: 'blog', action: 'delete' },
  { name: 'user:create', resource: 'user', action: 'create' },
  { name: 'user:read', resource: 'user', action: 'read' },
  { name: 'user:update', resource: 'user', action: 'update' },
  { name: 'user:delete', resource: 'user', action: 'delete' },
  { name: 'category:create', resource: 'category', action: 'create' },
  { name: 'category:read', resource: 'category', action: 'read' },
  { name: 'category:update', resource: 'category', action: 'update' },
  { name: 'category:delete', resource: 'category', action: 'delete' },
  { name: 'tag:create', resource: 'tag', action: 'create' },
  { name: 'tag:read', resource: 'tag', action: 'read' },
  { name: 'tag:update', resource: 'tag', action: 'update' },
  { name: 'tag:delete', resource: 'tag', action: 'delete' },
];

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

  if (!targetAction && resourceOrPermission.includes(':')) {
    const parts = resourceOrPermission.split(':');
    targetResource = parts[0];
    targetAction = parts[1];
  }

  // Admin users bypass and have full access
  if (isAdminRole(user)) {
    return true;
  }

  const permissions: any[] =
    user.role && typeof user.role === 'object' && Array.isArray(user.role.permissions)
      ? user.role.permissions
      : Array.isArray(user.permissions)
      ? user.permissions
      : [];

  return permissions.some((perm) => {
    if (!perm) return false;
    if (typeof perm === 'string') {
      return (
        perm === `${targetResource}:${targetAction}` ||
        perm === `${targetResource}:*` ||
        perm === '*:*' ||
        perm === '*'
      );
    }
    const pResource = perm.resource;
    const pAction = perm.action;
    const pName = perm.name;

    if (pResource === '*' && pAction === '*') return true;
    if (pResource === targetResource && (pAction === targetAction || pAction === '*')) return true;
    if (pName && targetAction && pName === `${targetResource}:${targetAction}`) return true;
    if (pName && pName === targetResource) return true;

    return false;
  });
}

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return req.cookies.get('accessToken')?.value || req.cookies.get('token')?.value || null;
}

/*
  Route middleware wrapper that verifies JWT identity and dynamically authorizes
  based on current user role and permissions from MongoDB.
*/
export function withPermission(
  resource: string,
  action: Action,
  handler: RouteHandler
) {
  return async (req: NextRequest, ctx?: any): Promise<Response> => {
    try {
      const token = extractToken(req);
      if (!token) {
        return ApiResponse.error(401, false, 'Unauthorized: Token missing', null);
      }

      let decoded: any;
      try {
        decoded = verifyAccessToken(token);
      } catch {
        return ApiResponse.error(401, false, 'Unauthorized: Invalid or expired token', null);
      }

      const userId = decoded?.userId || decoded?.id;
      if (!userId) {
        return ApiResponse.error(401, false, 'Unauthorized: Invalid token payload', null);
      }

      await connectDB();

      const user = await User.findById(userId).populate({
        path: 'role',
        populate: { path: 'permissions' },
      });

      if (!user) {
        return ApiResponse.error(401, false, 'Unauthorized: User not found', null);
      }

      if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && user.tokenVersion !== decoded.tokenVersion) {
        return ApiResponse.error(401, false, 'Unauthorized: Session revoked', null);
      }

      if (!user.role || typeof user.role === 'string' || !(user.role as any).permissions) {
        const roleDoc = await getRole(typeof user.role === 'string' ? user.role : 'employee');
        if (roleDoc) {
          user.role = roleDoc;
        }
      }

      if (!hasPermission(user, resource, action)) {
        return ApiResponse.error(403, false, `Forbidden: Insufficient permissions for ${resource}:${action}`, null);
      }

      return await handler(req, ctx, user);
    } catch (error: any) {
      return ApiResponse.error(500, false, 'Internal Server Error', error.message);
    }
  };
}
