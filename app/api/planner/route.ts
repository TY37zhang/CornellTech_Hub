import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log("Session in POST:", session);

        if (!session?.user?.id) {
            console.error("Unauthorized: No session or user ID");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            courseId,
            requirementType,
            semester,
            year,
            status = "planned",
            notes = "",
        } = body;

        console.log("Received planner POST request:", {
            userId: session.user.id,
            courseId,
            requirementType,
            semester,
            year,
            status,
        });

        if (!courseId || !requirementType || !semester || !year) {
            const missingFields = [];
            if (!courseId) missingFields.push("courseId");
            if (!requirementType) missingFields.push("requirementType");
            if (!semester) missingFields.push("semester");
            if (!year) missingFields.push("year");

            console.error("Missing required fields:", missingFields);
            return new NextResponse(
                `Missing required fields: ${missingFields.join(", ")}`,
                { status: 400 }
            );
        }

        // Verify the course exists
        const courseExists = await db.course.findUnique({
            where: { id: courseId },
        });

        if (!courseExists) {
            console.error("Course not found:", courseId);
            return new NextResponse("Course not found", { status: 404 });
        }

        // Save or update the course plan
        const coursePlan = await db.coursePlanner.upsert({
            where: {
                unique_user_course_semester: {
                    userId: session.user.id,
                    courseId,
                    semester,
                    year,
                },
            },
            update: {
                requirementType,
                status,
                notes,
            },
            create: {
                userId: session.user.id,
                courseId,
                requirementType,
                semester,
                year,
                status,
                notes,
            },
        });

        console.log("Course plan saved successfully:", coursePlan);
        return NextResponse.json(coursePlan);
    } catch (error) {
        console.error("[PLANNER_POST] Detailed error:", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Error",
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log("Session in GET:", session);

        if (!session?.user?.id) {
            console.error("Unauthorized: No session or user ID");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        console.log("Fetching course plans for user:", session.user.id);

        // Get all course plans for the user with course details
        const coursePlans = await db.coursePlanner.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                course: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log(`Found ${coursePlans.length} course plans`);
        return NextResponse.json(coursePlans);
    } catch (error) {
        console.error("[PLANNER_GET] Detailed error:", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Error",
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log("Session in DELETE:", session);

        if (!session?.user?.id) {
            console.error("Unauthorized: No session or user ID");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");
        const semester = searchParams.get("semester");
        const year = searchParams.get("year");

        console.log("Received planner DELETE request:", {
            userId: session.user.id,
            courseId,
            semester,
            year,
        });

        if (!courseId || !semester || !year) {
            const missingFields = [];
            if (!courseId) missingFields.push("courseId");
            if (!semester) missingFields.push("semester");
            if (!year) missingFields.push("year");

            console.error("Missing required fields:", missingFields);
            return new NextResponse(
                `Missing required fields: ${missingFields.join(", ")}`,
                { status: 400 }
            );
        }

        // Delete the course plan
        await db.coursePlanner.delete({
            where: {
                unique_user_course_semester: {
                    userId: session.user.id,
                    courseId,
                    semester,
                    year: parseInt(year),
                },
            },
        });

        console.log("Course plan deleted successfully");
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[PLANNER_DELETE] Detailed error:", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Error",
            { status: 500 }
        );
    }
}
