import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { cloudinary } from "@/lib/cloudinary";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

// Define the request schema
const updateAvatarSchema = z.object({
    avatar_url: z.string().url({
        message: "Please provide a valid image URL.",
    }),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Convert buffer to base64 string
        const base64Image = buffer.toString("base64");
        const dataURI = `data:${file.type};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: "image",
            folder: "profile_pictures",
        });

        if (!result || !("secure_url" in result)) {
            console.error("Invalid Cloudinary result:", result);
            return NextResponse.json(
                { error: "Failed to upload image" },
                { status: 500 }
            );
        }

        const dbResult = await sql`
            UPDATE users
            SET avatar_url = ${result.secure_url}
            WHERE email = ${session.user.email}
            RETURNING id, name, email, avatar_url
        `;

        if (dbResult.length === 0) {
            console.error("No user found with email:", session.user.email);
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const updatedUser = dbResult[0];
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user avatar:", error);
        return NextResponse.json(
            { error: "Failed to update user avatar" },
            { status: 500 }
        );
    }
}
