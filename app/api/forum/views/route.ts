import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// Extract UUID from a slug or return as-is if already a UUID
const extractUUID = (id: string): string =>
    id.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    )?.[0] ?? id;

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

        const user_id: string | null = session?.user?.id ?? null;
        const actualPostId = extractUUID(post_id);

        // Insert view (skipDuplicates handles logged-in duplicate case; anonymous duplicates are OK)
        await prisma.forum_views.createMany({
            data: [{ post_id: actualPostId, user_id }],
            skipDuplicates: true,
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording forum view:", error);
        return NextResponse.json(
            { success: false, error: "Failed to record view" },
            { status: 500 }
        );
    }
}
