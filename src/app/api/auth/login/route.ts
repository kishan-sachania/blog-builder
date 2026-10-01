import { ApiResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { getUserByEmail } from "@/services/authService";
import { TokenServices } from "@/services/tokenServices";
import bcrypt from 'bcrypt';

import { setAuthCookies } from "@/lib/cookies";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        if (!body) {
            return ApiResponse.error(400, false, "Request body is required", null);
        }

        const { password, email } = body;
        if (!password || !email) {
            return ApiResponse.error(400, false, "Email and password are required", null);
        }

        await connectDB();

        const user = await getUserByEmail(email);
        if (!user) {
            return ApiResponse.error(401, false, "Invalid email or password", null);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return ApiResponse.error(401, false, "Invalid email or password", null);
        }

        const safeUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };

        const { accessToken, refreshToken } = TokenServices.generateTokens(safeUser);

        const response = ApiResponse.success(200, true, "User logged in successfully", {
            user: safeUser,
            accessToken,
            refreshToken,
        });

        // Set server-side cookies
        setAuthCookies(response, accessToken, refreshToken);

        return response;

    } catch (error: any) {
        return ApiResponse.error(500, false, "Something went wrong", error.message);
    }
};