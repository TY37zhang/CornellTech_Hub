import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        try {
            const user = await prisma.users.findUnique({
                where: { email: session.user.email },
                select: { name: true, email: true, program: true },
            });

            if (!user) {
                return new NextResponse("User not found", { status: 404 });
            }

            return NextResponse.json(user);
        } catch (dbError) {
            return new NextResponse(
                JSON.stringify({
                    error: "Database error",
                    message:
                        dbError instanceof Error
                            ? dbError.message
                            : "Unknown error",
                }),
                { status: 500 }
            );
        }
    } catch (error) {
        return new NextResponse(
            JSON.stringify({
                error: "Server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, program } = body;

        try {
            const updatedUser = await prisma.users.update({
                where: { email: session.user.email },
                data: { name, program },
                select: { name: true, email: true, program: true },
            });

            return NextResponse.json(updatedUser);
        } catch (dbError) {
            return new NextResponse(
                JSON.stringify({
                    error: "Database error",
                    message:
                        dbError instanceof Error
                            ? dbError.message
                            : "Unknown error",
                }),
                { status: 500 }
            );
        }
    } catch (error) {
        return new NextResponse(
            JSON.stringify({
                error: "Server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500 }
        );
    }
}
