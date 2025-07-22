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

        // Enhanced file validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
                { status: 400 }
            );
        }

        // File size validation (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size must be less than 5MB" },
                { status: 400 }
            );
        }

        // Minimum file size validation (to prevent empty files)
        const minSize = 1024; // 1KB
        if (file.size < minSize) {
            return NextResponse.json(
                { error: "File size must be at least 1KB" },
                { status: 400 }
            );
        }

        // Validate file name
        if (file.name.length > 255) {
            return NextResponse.json(
                { error: "File name is too long" },
                { status: 400 }
            );
        }

        // Check for suspicious file names
        const suspiciousPatterns = [
            /\.php$/i,
            /\.exe$/i,
            /\.bat$/i,
            /\.cmd$/i,
            /\.scr$/i,
            /\.js$/i,
            /\.html$/i,
            /\.htm$/i,
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
            return NextResponse.json(
                { error: "File name contains suspicious patterns" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Basic file header validation
        const fileSignatures = {
            'jpeg': [0xFF, 0xD8, 0xFF],
            'png': [0x89, 0x50, 0x4E, 0x47],
            'webp': [0x52, 0x49, 0x46, 0x46], // RIFF
        };

        const validateFileSignature = (buffer: Buffer, type: string): boolean => {
            if (type === 'image/jpeg' || type === 'image/jpg') {
                const jpegSignature = fileSignatures.jpeg;
                return jpegSignature.every((byte, index) => buffer[index] === byte);
            } else if (type === 'image/png') {
                const pngSignature = fileSignatures.png;
                return pngSignature.every((byte, index) => buffer[index] === byte);
            } else if (type === 'image/webp') {
                const webpSignature = fileSignatures.webp;
                return webpSignature.every((byte, index) => buffer[index] === byte) &&
                       buffer.slice(8, 12).toString() === 'WEBP';
            }
            return false;
        };

        if (!validateFileSignature(buffer, file.type)) {
            return NextResponse.json(
                { error: "File content does not match the declared file type" },
                { status: 400 }
            );
        }

        // Convert buffer to base64 string
        const base64Image = buffer.toString("base64");
        const dataURI = `data:${file.type};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: "image",
            folder: "profile_pictures",
            // Additional Cloudinary security options
            quality: "auto:good",
            format: "auto",
            transformation: [
                { width: 500, height: 500, crop: "limit" }, // Limit maximum dimensions
                { quality: "auto:good" },
                { fetch_format: "auto" }
            ],
            // Security settings
            invalidate: true, // Invalidate cached versions
            overwrite: true,
            unique_filename: true,
            use_filename: false, // Don't use original filename for security
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
