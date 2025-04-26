import { NextResponse } from "next/server";
import { getRelatedPosts } from "@/app/forum/actions";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get("postId");
        const category = searchParams.get("category");

        if (!postId || !category) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const posts = await getRelatedPosts(postId, category);
        return NextResponse.json({ success: true, posts });
    } catch (error) {
        console.error("Error fetching related posts:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch related posts" },
            { status: 500 }
        );
    }
}
