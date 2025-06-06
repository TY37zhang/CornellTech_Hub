import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

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
            const result = await sql`
                SELECT name, email, program
                FROM users
                WHERE email = ${session.user.email}
            `;

            if (!result || result.length === 0) {
                return new NextResponse("User not found", { status: 404 });
            }

            return NextResponse.json(result[0]);
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
            const user = await sql`
                UPDATE users
                SET name = ${name}, program = ${program}
                WHERE email = ${session.user.email}
                RETURNING name, email, program
            `;

            if (!user || user.length === 0) {
                return new NextResponse("User not found", { status: 404 });
            }

            return NextResponse.json(user[0]);
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
