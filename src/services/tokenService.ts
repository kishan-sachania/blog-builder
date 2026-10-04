import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User } from '@/models';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  id: string;
  email?: string;
  tokenVersion?: number;
}

export function generateTokens(user: { id?: string; _id?: any; email?: string; tokenVersion?: number }) {
  const accessSecret = process.env.ACCESS_SECRET || process.env.JWT_SECRET;
  const refreshSecret = process.env.REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || accessSecret;

  if (!accessSecret || !refreshSecret) {
    throw new Error('ACCESS_SECRET and REFRESH_SECRET must be defined in environment variables');
  }

  const userId = user.id ? user.id.toString() : (user._id ? user._id.toString() : '');

  const payload: TokenPayload = {
    userId,
    id: userId,
    email: user.email,
    tokenVersion: user.tokenVersion,
  };

  const accessToken = jwt.sign(payload, accessSecret, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: REFRESH_EXPIRY });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  const accessSecret = process.env.ACCESS_SECRET || process.env.JWT_SECRET;
  if (!accessSecret) {
    throw new Error('ACCESS_SECRET is not configured');
  }
  return jwt.verify(token, accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const refreshSecret = process.env.REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || process.env.ACCESS_SECRET;
  if (!refreshSecret) {
    throw new Error('REFRESH_SECRET is not configured');
  }
  return jwt.verify(token, refreshSecret) as TokenPayload;
}

export async function refreshToken(token: string) {
  const decoded = verifyRefreshToken(token);
  const userId = decoded?.userId || decoded?.id;
  if (!userId) {
    throw new Error('Invalid token payload');
  }

  await connectDB();
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found or account deactivated');
  }

  if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && user.tokenVersion !== decoded.tokenVersion) {
    throw new Error('Session revoked or token version mismatch');
  }

  return generateTokens({
    id: user._id.toString(),
    email: user.email,
    tokenVersion: user.tokenVersion,
  });
}

export const tokenService = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  refreshToken,
};
