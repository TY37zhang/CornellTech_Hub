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
        console.log("Session:", session);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        console.log("File received:", file?.name, file?.type, file?.size);

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log("File converted to buffer");

        // Upload to Cloudinary
        console.log("Starting Cloudinary upload...");
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        resource_type: "image",
                        folder: "profile_pictures",
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary upload error:", error);
                            reject(error);
                        } else {
                            console.log("Cloudinary upload result:", result);
                            resolve(result);
                        }
                    }
                )
                .end(buffer);
        });

        if (!result || !("secure_url" in result)) {
            console.error("Invalid Cloudinary result:", result);
            throw new Error("Failed to upload image to Cloudinary");
        }

        console.log(
            "Updating database with new avatar URL:",
            result.secure_url
        );
        // Update user's avatar_url in database
        const dbResult = await sql`
            UPDATE users
            SET avatar_url = ${result.secure_url}
            WHERE email = ${session.user.email}
            RETURNING id, name, email, avatar_url
        `;
        console.log("Database update result:", dbResult);

        if (dbResult.length === 0) {
            console.error("No user found with email:", session.user.email);
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Return the updated user data
        const updatedUser = dbResult[0];
        console.log("Returning updated user data:", updatedUser);
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user avatar:", error);
        return NextResponse.json(
            { error: "Failed to update user avatar" },
            { status: 500 }
        );
    }
}
