import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TokenService } from "@/lib/services/TokenService";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const usage = await TokenService.getUserUsage(session.user.id);
        return NextResponse.json({
            used: usage.tokens_used,
            max: TokenService.MONTHLY_LIMIT,
        });
    } catch (error) {
        console.error("Token usage API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
