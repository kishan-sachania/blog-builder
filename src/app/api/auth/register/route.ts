import { createUser } from "@/services/authService";
import { ApiResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import { TokenServices } from "@/services/tokenServices";
import { setAuthCookies } from "@/lib/cookies";
import bcrypt from "bcrypt";
import { ERole } from "@/lib/util";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        if (!body) {
            return ApiResponse.error(400, false, "Request body is required", null);
        }

        const { name, email, password } = body;

        await connectDB();

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = await createUser({
            name,
            email,
            password: hashedPassword,
            role: ERole.EMPLOYEE,
        });

        const safeUser = {
            id: createdUser._id.toString(),
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
        };

        const { accessToken, refreshToken } = TokenServices.generateTokens(safeUser);

        const response = ApiResponse.success(201, true, "User registered successfully", {
            user: safeUser,
            accessToken,
            refreshToken,
        });

        // Set server-side cookies
        setAuthCookies(response, accessToken, refreshToken);

        return response;

    } catch (error: any) {
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors)
                .map((err: any) => err.message)
                .join(", ");
            return ApiResponse.error(400, false, message, null);
        }

        if (error.code === 11000 || error.message === "User already exists") {
            return ApiResponse.error(409, false, "User already exists with this email", null);
        }

        return ApiResponse.error(500, false, "Something went wrong", error.message);
    }
};