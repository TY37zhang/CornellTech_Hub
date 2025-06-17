import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const plans = await prisma.course_planner.findMany({
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
                        full_code: true,
                        concentration_core: true,
                        concentration_elective: true,
                        professor_id: true,
                    },
                },
            },
        });

        const transformedPlans = plans
            .map((plan) => ({
                id: plan.id,
                userId: plan.user_id,
                course: {
                    id: plan.courses.id,
                    code: plan.courses.code,
                    name: plan.courses.name,
                    description: plan.courses.description,
                    credits: plan.courses.credits,
                    department: plan.courses.department,
                    fullCode: plan.courses.full_code,
                    concentrationCore: plan.courses.concentration_core,
                    concentrationElective: plan.courses.concentration_elective,
                    professorId: plan.courses.professor_id,
                    taken: plan.taken,
                },
                requirementType: plan.requirement_type,
                semester: plan.semester,
                year: plan.year,
                status: plan.status,
                notes: plan.notes,
                createdAt: plan.created_at,
                updatedAt: plan.updated_at,
            }))
            .sort((a, b) => {
                const yearDiff = (a.year ?? 0) - (b.year ?? 0);
                if (yearDiff !== 0) return yearDiff;
                const semA = a.semester ?? "";
                const semB = b.semester ?? "";
                return semA.localeCompare(semB);
            });

        return NextResponse.json(transformedPlans);
    } catch (error) {
        console.error("Error fetching course plans:", error);
        return NextResponse.json(
            { error: "Failed to fetch course plans" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            courseId,
            requirementType,
            semester,
            year,
            status = "planned",
            notes = "",
            taken = false,
        } = body;

        const created = await prisma.course_planner.create({
            data: {
                user_id: session.user.id,
                course_id: courseId,
                requirement_type: requirementType,
                semester,
                year,
                status,
                notes,
                taken,
            },
            include: {
                courses: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        credits: true,
                        department: true,
                        full_code: true,
                        concentration_core: true,
                        concentration_elective: true,
                        professor_id: true,
                    },
                },
            },
        });

        const transformedPlan = {
            id: created.id,
            userId: created.user_id,
            course: {
                id: created.courses.id,
                code: created.courses.code,
                name: created.courses.name,
                description: created.courses.description,
                credits: created.courses.credits,
                department: created.courses.department,
                fullCode: created.courses.full_code,
                concentrationCore: created.courses.concentration_core,
                concentrationElective: created.courses.concentration_elective,
                professorId: created.courses.professor_id,
                taken: created.taken,
            },
            requirementType: created.requirement_type,
            semester: created.semester,
            year: created.year,
            status: created.status,
            notes: created.notes,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
        };

        return NextResponse.json(transformedPlan);
    } catch (error) {
        console.error("Error creating course plan:", error);
        return NextResponse.json(
            { error: "Failed to create course plan" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, requirementType, semester, year, status, notes, taken } =
            body;

        await prisma.course_planner.updateMany({
            where: {
                id,
                user_id: session.user.id,
            },
            data: {
                requirement_type: requirementType,
                semester,
                year,
                status,
                notes,
                taken,
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating course plan:", error);
        return NextResponse.json(
            { error: "Failed to update course plan" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const courseId = searchParams.get("courseId");

        if (!id && !courseId) {
            return new NextResponse("Missing course plan ID or course ID", {
                status: 400,
            });
        }

        if (id) {
            await prisma.course_planner.deleteMany({
                where: {
                    id,
                    user_id: session.user.id,
                },
            });
        } else if (courseId) {
            await prisma.course_planner.deleteMany({
                where: {
                    course_id: courseId,
                    user_id: session.user.id,
                },
            });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting course plan:", error);
        return NextResponse.json(
            { error: "Failed to delete course plan" },
            { status: 500 }
        );
    }
}
