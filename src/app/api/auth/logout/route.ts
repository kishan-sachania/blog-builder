import { ApiResponse } from "@/lib/api-response";
import { clearAuthCookies } from "@/lib/cookies";

export const POST = async () => {
    const response = ApiResponse.success(200, true, "Logged out successfully", null);
    clearAuthCookies(response);
    return response;
};
