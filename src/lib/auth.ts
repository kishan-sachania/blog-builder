import { cookies } from 'next/headers';
import { User as UserType } from '@/types';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { getRole } from '@/services/roleService';
import { verifyAccessToken } from '@/services/tokenService';
import { hasPermission } from '@/lib/rbac';

import { getRoleName, isAdminRole } from '@/lib/roles';

export const AUTH_COOKIE_NAME = 'accessToken';

export { getRoleName, isAdminRole };

export async function getCurrentUser(): Promise<UserType | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get('token')?.value;

    if (!token) return null;

    const decoded = verifyAccessToken(token);
    const userId = decoded?.userId || decoded?.id;
    if (!userId) return null;

    await connectDB();

    const dbUser = await User.findById(userId).populate({
      path: 'role',
      populate: {
        path: 'permissions',
      },
    });

    if (!dbUser) return null;

    // Invalidate session if token version has changed
    if (decoded.tokenVersion !== undefined && dbUser.tokenVersion !== undefined && dbUser.tokenVersion !== decoded.tokenVersion) {
      return null;
    }

    let roleObj = dbUser.role as any;
    if (!roleObj || typeof roleObj === 'string' || !roleObj.name) {
      roleObj = await getRole(typeof dbUser.role === 'string' ? dbUser.role : 'employee');
    }

    const roleName = getRoleName(roleObj);
    const isUserAdmin = isAdminRole(roleName);

    const permissions = Array.isArray(roleObj?.permissions)
      ? roleObj.permissions.map((p: any) => ({
          resource: p.resource || '',
          action: p.action || '',
          name: p.name || `${p.resource}:${p.action}`,
        }))
      : [];

    return {
      id: dbUser._id.toString(),
      name: dbUser.name || 'Author',
      email: dbUser.email || '',
      passwordHash: '',
      role: isUserAdmin ? 'admin' : 'employee',
      roleName: roleObj?.name || (isUserAdmin ? 'admin' : 'employee'),
      permissions,
      title: dbUser.title || (isUserAdmin ? 'Editor-in-Chief' : 'Staff Contributor'),
      department: dbUser.department || (isUserAdmin ? 'Editorial Board' : 'Editorial'),
      avatarUrl: dbUser.avatar || '',
      bio: dbUser.bio || '',
      joinedDate: dbUser.createdAt
        ? new Date(dbUser.createdAt).getFullYear().toString()
        : '2024',
      createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : '',
    };
  } catch {
    return null;
  }
}

export { hasPermission };
