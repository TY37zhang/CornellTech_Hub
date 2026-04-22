import { NextResponse } from "next/server";

interface PublicHealthStatus {
    status: "healthy";
    timestamp: string;
    version: string;
}

export async function GET(): Promise<NextResponse> {
    const result: PublicHealthStatus = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
    };

    const response = NextResponse.json(result, { status: 200 });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
}

export async function HEAD(): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 });
}
