import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;
        const postId = params.id;

        if (!userEmail) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 }
            );
        }

        // First verify the post belongs to the user using a direct SQL query
        const post = await prisma.post.findMany({
            where: {
                id: postId,
                authorEmail: userEmail,
            },
            select: {
                id: true,
            },
        });

        if (!post || post.length === 0) {
            return NextResponse.json(
                { error: "Post not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete the post using a direct SQL query
        await prisma.post.delete({
            where: {
                id: postId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
