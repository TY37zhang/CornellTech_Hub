import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { courseId, day, startTime, endTime } = body;

        if (!courseId || !day || !startTime || !endTime) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Save the schedule to the database
        const schedule = await db.courseSchedule.create({
            data: {
                userId: session.user.id,
                courseId,
                day,
                startTime,
                endTime,
            },
        });

        return NextResponse.json(schedule);
    } catch (error) {
        console.error("[SCHEDULE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get all schedules for the user
        const schedules = await db.courseSchedule.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                course: true,
            },
        });

        return NextResponse.json(schedules);
    } catch (error) {
        console.error("[SCHEDULE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const scheduleId = searchParams.get("id");

        if (!scheduleId) {
            return new NextResponse("Missing schedule ID", { status: 400 });
        }

        // Delete the schedule
        await db.courseSchedule.delete({
            where: {
                id: scheduleId,
                userId: session.user.id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[SCHEDULE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
