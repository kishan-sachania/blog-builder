import jwt from 'jsonwebtoken';

const REFRESH_EXPIRY = "7d";
const ACCESS_EXPIRY = "15m";

export type TokenUser = {
    id: string;
    email: string;
    name?: string;
    role?: string;
};

class TokenServices {
    static generateTokens(user: TokenUser) {
        const accessSecret = process.env.ACCESS_SECRET;
        const refreshSecret = process.env.REFRESH_SECRET;

        if (!accessSecret || !refreshSecret) {
            throw new Error("ACCESS_SECRET and REFRESH_SECRET must be defined in environment variables");
        }

        const accessToken = jwt.sign({ user }, accessSecret, { expiresIn: ACCESS_EXPIRY });
        const refreshToken = jwt.sign({ user }, refreshSecret, { expiresIn: REFRESH_EXPIRY });

        return { accessToken, refreshToken };
    }

    static verifyAccessToken(token: string) {
        const accessSecret = process.env.ACCESS_SECRET;
        if (!accessSecret) {
            throw new Error("ACCESS_SECRET not defined");
        }
        return jwt.verify(token, accessSecret) as { user: TokenUser };
    }

    static verifyRefreshToken(token: string) {
        const refreshSecret = process.env.REFRESH_SECRET;
        if (!refreshSecret) {
            throw new Error("REFRESH_SECRET not defined");
        }
        return jwt.verify(token, refreshSecret) as { user: TokenUser };
    }

    static refreshToken(token: string) {
        const decodedToken = this.verifyRefreshToken(token);
        return this.generateTokens(decodedToken.user);
    }
}

export { TokenServices };