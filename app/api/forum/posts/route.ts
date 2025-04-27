import { NextResponse } from "next/server";
import { getForumPosts } from "@/app/forum/actions";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const postsData = await getForumPosts(search, limit, offset);
        return NextResponse.json({ success: true, ...postsData });
    } catch (error) {
        console.error("Error fetching forum posts:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch forum posts" },
            { status: 500 }
        );
    }
}
