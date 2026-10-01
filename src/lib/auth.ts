import { cookies } from 'next/headers';
import { User } from '@/types';
import jwt from 'jsonwebtoken'

export const AUTH_COOKIE_NAME = 'accessToken';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET!
    ) as { user: User }
    return decoded.user
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}

