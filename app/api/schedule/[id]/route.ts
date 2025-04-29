import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function PATCH(req: Request, context: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await Promise.resolve(context.params);
        const body = await req.json();
        const { day, startTime, endTime } = body;

        if (!day || !startTime || !endTime) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Update the schedule using SQL
        const result = await sql`
            UPDATE course_schedules
            SET 
                day = ${day},
                start_time = ${startTime},
                end_time = ${endTime},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            AND user_id = ${session.user.id}
            RETURNING *
        `;

        if (!result || result.length === 0) {
            return new NextResponse("Schedule not found", { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("[SCHEDULE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
