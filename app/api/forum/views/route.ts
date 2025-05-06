import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { post_id } = await request.json();
        if (!post_id) {
            return NextResponse.json(
                { success: false, error: "Missing post_id" },
                { status: 400 }
            );
        }
        const user_id = session?.user?.id || null;
        // Insert view, allow user_id to be null for anonymous
        await sql`
            INSERT INTO forum_views (post_id, user_id)
            VALUES (${post_id}, ${user_id})
            ON CONFLICT (post_id, user_id) DO NOTHING
        `;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording forum view:", error);
        return NextResponse.json(
            { success: false, error: "Failed to record view" },
            { status: 500 }
        );
    }
}
