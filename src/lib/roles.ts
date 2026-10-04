/**
 * Shared Role & Permission Utilities (Safe for both Server and Client Components)
 */

export function getRoleName(user: any): string {
  if (!user) return 'employee';
  if (typeof user === 'string') return user.toLowerCase();
  if (typeof user.role === 'string') return user.role.toLowerCase();
  if (user.role && typeof user.role === 'object' && user.role.name) return String(user.role.name).toLowerCase();
  if (user.roleName) return String(user.roleName).toLowerCase();
  if (user.name && !user.role && !user.email) return String(user.name).toLowerCase();
  return 'employee';
}

export function isAdminRole(roleOrUser: any): boolean {
  const name = typeof roleOrUser === 'string' ? roleOrUser.toLowerCase() : getRoleName(roleOrUser);
  return name === 'admin' || name === 'administrator' || name === 'superadmin';
}
