import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { TokenServices } from '@/services/tokenServices';
import { setAuthCookies, clearAuthCookies } from '@/lib/cookies';

export const POST = async (req: NextRequest) => {
  try {
    let refreshToken: string | undefined;

    // 1. Try reading from JSON body
    try {
      const body = await req.json();
      refreshToken = body?.refreshToken;
    } catch {
      // Body might be empty when invoked with cookie-only auth
    }

    // 2. Try reading from Next.js request cookies
    if (!refreshToken && req.cookies) {
      refreshToken = req.cookies.get('refreshToken')?.value;
    }

    // 3. Try reading from standard Cookie header
    if (!refreshToken) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookies = cookieHeader.split(';').map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
      if (tokenCookie) {
        refreshToken = tokenCookie.split('=')[1];
      }
    }

    // 4. Try reading from Authorization header if passed as Bearer
    if (!refreshToken) {
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.substring(7).trim();
      }
    }

    if (!refreshToken) {
      const response = ApiResponse.error(401, false, 'Refresh token is required', null);
      clearAuthCookies(response);
      return response;
    }

    // Verify refresh token and generate fresh pair
    const tokens = await TokenServices.refreshToken(refreshToken);
    const response = ApiResponse.success(200, true, 'Tokens refreshed successfully', tokens);

    // Update server-side httpOnly cookies with refreshed access and refresh tokens
    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

    return response;
  } catch (error: any) {
    const response = ApiResponse.error(401, false, 'Invalid or expired refresh token', error?.message || null);
    clearAuthCookies(response);
    return response;
  }
};
