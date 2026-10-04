import { ApiResponse } from '@/lib/api-response';
import { connectDB } from '@/lib/db';
import { getUserByEmail } from '@/services/userService';
import { tokenService } from '@/services/tokenService';
import bcrypt from 'bcryptjs';
import { setAuthCookies } from '@/lib/cookies';
import { getRoleName } from '@/lib/auth';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    if (!body) {
      return ApiResponse.error(400, false, 'Request body is required', null);
    }

    const { password, email } = body;
    if (!password || !email) {
      return ApiResponse.error(400, false, 'Email and password are required', null);
    }

    await connectDB();

    const user = await getUserByEmail(email);
    if (!user) {
      return ApiResponse.error(401, false, 'Invalid email or password', null);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return ApiResponse.error(401, false, 'Invalid email or password', null);
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: getRoleName(user),
    };

    const { accessToken, refreshToken } = tokenService.generateTokens({
      id: user._id.toString(),
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    const response = ApiResponse.success(200, true, 'User logged in successfully', {
      user: safeUser,
      accessToken,
      refreshToken,
    });

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error: any) {
    return ApiResponse.error(500, false, 'Something went wrong', error.message);
  }
};