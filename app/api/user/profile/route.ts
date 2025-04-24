import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

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
        const result = await sql`
            SELECT id, name, email, avatar_url
            FROM users
            WHERE email = ${session.user.email}
        `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result[0]);
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
        const result = await sql`
            UPDATE users
            SET name = ${validatedData.name}
            WHERE email = ${session.user.email}
            RETURNING id, name, email, avatar_url
        `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result[0]);
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
