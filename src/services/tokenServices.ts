import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User } from '../../models/user';

const REFRESH_EXPIRY = '7d';
const ACCESS_EXPIRY = '15m';

export interface TokenPayload {
  userId: string;
  id: string;
  email?: string;
  tokenVersion?: number;
}

class TokenServices {
  // Identity-focused tokens; roles/permissions remain authoritative in MongoDB
  static generateTokens(user: { id?: string; _id?: any; email?: string; tokenVersion?: number }) {
    const accessSecret = process.env.ACCESS_SECRET || process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || process.env.ACCESS_SECRET;

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

  static verifyAccessToken(token: string): TokenPayload {
    const accessSecret = process.env.ACCESS_SECRET || process.env.JWT_SECRET;
    if (!accessSecret) {
      throw new Error('ACCESS_SECRET not defined');
    }
    return jwt.verify(token, accessSecret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    const refreshSecret = process.env.REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || process.env.ACCESS_SECRET;
    if (!refreshSecret) {
      throw new Error('REFRESH_SECRET not defined');
    }
    return jwt.verify(token, refreshSecret) as TokenPayload;
  }

  static async refreshToken(token: string) {
    const decodedToken = this.verifyRefreshToken(token);
    const userId = decodedToken?.userId || decodedToken?.id;
    if (!userId) {
      throw new Error('Invalid token payload');
    }
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found or account deactivated');
    }
    if (decodedToken.tokenVersion !== undefined && user.tokenVersion !== undefined && user.tokenVersion !== decodedToken.tokenVersion) {
      throw new Error('Token version mismatch / session revoked');
    }
    return this.generateTokens({
      id: user._id.toString(),
      email: user.email,
      tokenVersion: user.tokenVersion,
    });
  }
}

export { TokenServices };