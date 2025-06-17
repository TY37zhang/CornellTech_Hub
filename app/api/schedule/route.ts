import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const schedules = await prisma.course_schedules.findMany({
            where: { user_id: session.user.id },
            include: {
                courses: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        credits: true,
                        department: true,
                    },
                },
            },
            orderBy: [{ start_time: "asc" }], // will refine day order on client side below
        });

        // Custom sort for weekday order (Monday -> Sunday)
        const dayOrder: Record<string, number> = {
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
            Sunday: 7,
        };

        const transformedSchedules = schedules
            .map((schedule) => ({
                id: schedule.id,
                userId: schedule.user_id,
                courseId: schedule.course_id,
                course: {
                    id: schedule.courses.id,
                    code: schedule.courses.code,
                    name: schedule.courses.name,
                    description: schedule.courses.description,
                    credits: schedule.courses.credits,
                    department: schedule.courses.department,
                },
                day: schedule.day,
                startTime: schedule.start_time,
                endTime: schedule.end_time,
                createdAt: schedule.created_at,
                updatedAt: schedule.updated_at,
            }))
            .sort((a, b) => {
                const dayDiff = (dayOrder[a.day] || 8) - (dayOrder[b.day] || 8);
                if (dayDiff !== 0) return dayDiff;
                return a.startTime.localeCompare(b.startTime);
            });

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

        const newSchedule = await prisma.course_schedules.create({
            data: {
                user_id: session.user.id,
                course_id: courseId,
                day,
                start_time: startTime,
                end_time: endTime,
            },
            select: { id: true },
        });

        return NextResponse.json({ id: newSchedule.id });
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
            await prisma.course_schedules.deleteMany({
                where: {
                    id,
                    user_id: session.user.id,
                },
            });
        } else if (courseId) {
            // Delete all schedules for a specific course
            await prisma.course_schedules.deleteMany({
                where: {
                    course_id: courseId,
                    user_id: session.user.id,
                },
            });
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
