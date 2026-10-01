import { NextResponse } from "next/server";

export const GET = async () => {
    return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
};
