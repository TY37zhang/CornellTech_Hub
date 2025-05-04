import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const schedules = await sql`
            SELECT 
                cs.id,
                cs.user_id,
                cs.course_id,
                cs.day,
                cs.start_time,
                cs.end_time,
                cs.created_at,
                cs.updated_at,
                c.code,
                c.name,
                c.description,
                c.credits,
                c.department
            FROM course_schedules cs
            JOIN courses c ON cs.course_id = c.id
            WHERE cs.user_id = ${session.user.id}
            ORDER BY 
                CASE 
                    WHEN cs.day = 'Monday' THEN 1
                    WHEN cs.day = 'Tuesday' THEN 2
                    WHEN cs.day = 'Wednesday' THEN 3
                    WHEN cs.day = 'Thursday' THEN 4
                    WHEN cs.day = 'Friday' THEN 5
                    ELSE 6
                END,
                cs.start_time
        `;

        // Transform the data to match the expected format
        const transformedSchedules = schedules.map((schedule) => ({
            id: schedule.id,
            userId: schedule.user_id,
            courseId: schedule.course_id,
            course: {
                id: schedule.course_id,
                code: schedule.code,
                name: schedule.name,
                description: schedule.description,
                credits: schedule.credits,
                department: schedule.department,
            },
            day: schedule.day,
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            createdAt: schedule.created_at,
            updatedAt: schedule.updated_at,
        }));

        return NextResponse.json(transformedSchedules);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return NextResponse.json(
            { error: "Failed to fetch schedules" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { courseId, day, startTime, endTime } = body;

        const result = await sql`
            INSERT INTO course_schedules (
                user_id,
                course_id,
                day,
                start_time,
                end_time
            )
            VALUES (
                ${session.user.id},
                ${courseId},
                ${day},
                ${startTime},
                ${endTime}
            )
            RETURNING id
        `;

        return NextResponse.json({ id: result[0].id });
    } catch (error) {
        console.error("Error creating schedule:", error);
        return NextResponse.json(
            { error: "Failed to create schedule" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const courseId = searchParams.get("courseId");

        if (!id && !courseId) {
            return new NextResponse("Missing schedule ID or course ID", {
                status: 400,
            });
        }

        if (id) {
            // Delete a specific schedule by ID
            await sql`
                DELETE FROM course_schedules
                WHERE id = ${id} AND user_id = ${session.user.id}
            `;
        } else if (courseId) {
            // Delete all schedules for a specific course
            await sql`
                DELETE FROM course_schedules
                WHERE course_id = ${courseId} AND user_id = ${session.user.id}
            `;
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return NextResponse.json(
            { error: "Failed to delete schedule" },
            { status: 500 }
        );
    }
}
