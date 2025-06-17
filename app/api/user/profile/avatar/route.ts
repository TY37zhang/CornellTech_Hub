import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db/prisma";

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

        const updatedUser = await prisma.users.update({
            where: { email: session.user.email },
            data: { avatar_url: result.secure_url },
            select: { id: true, name: true, email: true, avatar_url: true },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user avatar:", error);
        return NextResponse.json(
            { error: "Failed to update user avatar" },
            { status: 500 }
        );
    }
}
