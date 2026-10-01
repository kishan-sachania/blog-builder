import { NextResponse } from "next/server";

export class ApiResponse {
    static success(status: number = 200, success: boolean = true, message: string, data: any) {
        return NextResponse.json({ status, success, message, data }, { status });
    }
    static error(status: number = 404, success: boolean = false, message: string, error: any) {
        return NextResponse.json({ status, success, message, error }, { status });
    }
}