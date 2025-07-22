import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sanitizeContent } from "@/lib/sanitization";

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

        // Sanitize the name field
        const nameSanitization = sanitizeContent(validatedData.name.trim(), 'text');
        
        if (!nameSanitization.isValid) {
            return NextResponse.json(
                { 
                    error: "Name contains inappropriate content",
                    violations: nameSanitization.violations
                },
                { status: 400 }
            );
        }

        const sanitizedName = nameSanitization.sanitized;

        // Additional validation
        if (sanitizedName.length < 2) {
            return NextResponse.json(
                { error: "Name must be at least 2 characters long" },
                { status: 400 }
            );
        }

        if (sanitizedName.length > 100) {
            return NextResponse.json(
                { error: "Name must be less than 100 characters long" },
                { status: 400 }
            );
        }

        // Check for suspicious patterns in name
        if (/^\d+$/.test(sanitizedName)) {
            return NextResponse.json(
                { error: "Name cannot be only numbers" },
                { status: 400 }
            );
        }

        // Update user profile in database
        const updatedUser = await prisma.users.update({
            where: { email: session.user.email },
            data: { name: sanitizedName },
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
