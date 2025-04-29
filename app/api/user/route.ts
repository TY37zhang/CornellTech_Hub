import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        try {
            const user = await db.user.findUnique({
                where: {
                    email: session.user.email,
                },
                select: {
                    name: true,
                    email: true,
                    program: true,
                },
            });

            if (!user) {
                return new NextResponse("User not found", { status: 404 });
            }

            return NextResponse.json(user);
        } catch (dbError) {
            console.error("Database error in GET /api/user:", {
                error: dbError,
                email: session.user.email,
                stack: dbError instanceof Error ? dbError.stack : undefined,
            });
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
        console.error("Error in GET /api/user:", {
            error,
            stack: error instanceof Error ? error.stack : undefined,
        });
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
            const user = await db.user.update({
                where: {
                    email: session.user.email,
                },
                data: {
                    name,
                    program,
                },
                select: {
                    name: true,
                    email: true,
                    program: true,
                },
            });

            if (!user) {
                return new NextResponse("User not found", { status: 404 });
            }

            return NextResponse.json(user);
        } catch (dbError) {
            console.error("Database error in PATCH /api/user:", {
                error: dbError,
                email: session.user.email,
                data: { name, program },
                stack: dbError instanceof Error ? dbError.stack : undefined,
            });
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
        console.error("Error in PATCH /api/user:", {
            error,
            stack: error instanceof Error ? error.stack : undefined,
        });
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
