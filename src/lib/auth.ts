import { cookies } from 'next/headers';
import { User as UserType } from '@/types';
import { connectDB } from '@/lib/db';
import { User } from '../../models/user';
import { Role } from '../../models/role';
import { Permission } from '../../models/permission';
import { getRole } from '@/services/roleServices';
import { TokenServices } from '@/services/tokenServices';
import { hasPermission } from '@/lib/rbac';

export const AUTH_COOKIE_NAME = 'accessToken';

void Role;
void Permission;

export async function getCurrentUser(): Promise<UserType | null> {
  try {
    let token: string | undefined;

    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get('token')?.value;
    } catch {
      // Called outside Next.js request context
    }

    if (!token) return null;

    const decoded = TokenServices.verifyAccessToken(token);
    const userId = decoded?.userId || decoded?.id;
    if (!userId) return null;

    await connectDB();

    void Role;
    void Permission;

    // Fetch user from MongoDB with populated role & permissions
    const dbUser = await User.findById(userId).populate({
      path: 'role',
      populate: {
        path: 'permissions',
      },
    });

    if (!dbUser) return null;

    // Invalidate session if token version has changed
    const tokenVersion = decoded?.tokenVersion;
    if (tokenVersion !== undefined && dbUser.tokenVersion !== undefined && dbUser.tokenVersion !== tokenVersion) {
      return null;
    }

    let roleObj = dbUser.role as any;
    if (!roleObj || typeof roleObj === 'string' || !roleObj.name) {
      roleObj = await getRole(typeof dbUser.role === 'string' ? dbUser.role : 'employee');
    }

    let roleName = 'employee';
    if (roleObj && typeof roleObj === 'object' && roleObj.name) {
      roleName = roleObj.name.toLowerCase();
    } else if (typeof roleObj === 'string') {
      roleName = roleObj.toLowerCase();
    }

    const isUserAdmin =
      roleName === 'admin' || roleName === 'administrator' || roleName === 'superadmin';

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
      title: (dbUser as any).title || (isUserAdmin ? 'Editor-in-Chief' : 'Staff Contributor'),
      department: (dbUser as any).department || (isUserAdmin ? 'Editorial Board' : 'Editorial'),
      avatarUrl: dbUser.avatar || (dbUser as any).avatarUrl || '',
      bio: (dbUser as any).bio || '',
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
