import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { day, startTime, endTime } = body;

        if (!day || !startTime || !endTime) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Update the schedule
        const schedule = await db.courseSchedule.update({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: {
                day,
                startTime,
                endTime,
            },
        });

        return NextResponse.json(schedule);
    } catch (error) {
        console.error("[SCHEDULE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
