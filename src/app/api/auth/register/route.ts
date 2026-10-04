import { createUser } from '@/services/userService';
import { ApiResponse } from '@/lib/api-response';
import { connectDB } from '@/lib/db';
import { tokenService } from '@/services/tokenService';
import { setAuthCookies } from '@/lib/cookies';
import { ERole } from '@/lib/util';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    if (!body) {
      return ApiResponse.error(400, false, 'Request body is required', null);
    }

    const { name, email, password } = body;
    if (!name || !email || !password) {
      return ApiResponse.error(400, false, 'Name, email, and password are required', null);
    }

    await connectDB();

    const createdUser = await createUser({
      name,
      email,
      password,
      role: ERole.EMPLOYEE,
    });

    const safeUser = {
      id: createdUser._id.toString(),
      name: createdUser.name,
      email: createdUser.email,
      role: 'employee',
    };

    const { accessToken, refreshToken } = tokenService.generateTokens({
      id: createdUser._id.toString(),
      email: createdUser.email,
      tokenVersion: createdUser.tokenVersion,
    });

    const response = ApiResponse.success(201, true, 'User registered successfully', {
      user: safeUser,
      accessToken,
      refreshToken,
    });

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      return ApiResponse.error(400, false, message, null);
    }

    if (error.code === 11000 || error.message === 'User already exists') {
      return ApiResponse.error(409, false, 'User already exists with this email', null);
    }

    return ApiResponse.error(500, false, 'Something went wrong', error.message);
  }
};