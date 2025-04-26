import { NextResponse } from "next/server";
import { getForumPostById } from "@/app/forum/actions";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const post = await getForumPostById(params.id);

        if (!post) {
            return NextResponse.json(
                { success: false, error: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch post" },
            { status: 500 }
        );
    }
}
