import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

        // Ensure the schedule belongs to the current user
        const existing = await prisma.course_schedules.findUnique({
            where: { id },
        });

        if (!existing || existing.user_id !== session.user.id) {
            return new NextResponse("Schedule not found", { status: 404 });
        }

        const updatedSchedule = await prisma.course_schedules.update({
            where: { id },
            data: {
                day,
                start_time: startTime,
                end_time: endTime,
                updated_at: new Date(),
            },
        });

        return NextResponse.json(updatedSchedule);
    } catch (error) {
        console.error("[SCHEDULE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
