import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

// Define the request schema
const updateProfileSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
});

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user profile from database
        const user = await prisma.users.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, email: true, avatar_url: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch user profile" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate request body
        const validatedData = updateProfileSchema.parse(body);

        // Update user profile in database
        const updatedUser = await prisma.users.update({
            where: { email: session.user.email },
            data: { name: validatedData.name },
            select: { id: true, name: true, email: true, avatar_url: true },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user profile:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update user profile" },
            { status: 500 }
        );
    }
}
