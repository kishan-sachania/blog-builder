import { ApiResponse } from "@/lib/api-response";
import { TokenServices } from "@/services/tokenServices";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { refreshToken } = body || {};

        if (!refreshToken) {
            return ApiResponse.error(400, false, "Refresh token is required", null);
        }

        const tokens = TokenServices.refreshToken(refreshToken);

        return ApiResponse.success(200, true, "Tokens refreshed successfully", tokens);
    } catch (error: any) {
        return ApiResponse.error(401, false, "Invalid or expired refresh token", error.message);
    }
};
