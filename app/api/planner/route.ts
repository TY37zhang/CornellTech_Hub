import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch the user's course plans from the database
        const coursePlans = await sql`
            SELECT 
                cp.id as plan_id,
                cp.user_id,
                cp.course_id,
                cp.requirement_type,
                cp.semester,
                cp.year,
                cp.status,
                cp.notes,
                cp.created_at,
                cp.updated_at,
                c.id,
                c.code,
                c.name,
                c.description,
                c.credits,
                c.department,
                c.full_code,
                c.concentration_core,
                c.concentration_elective,
                c.professor_id
            FROM course_planner cp
            JOIN courses c ON cp.course_id = c.id
            WHERE cp.user_id = ${session.user.id}
            ORDER BY cp.year, cp.semester
        `;

        // Transform the data to match the expected format
        const transformedPlans = coursePlans.map((plan) => ({
            id: plan.plan_id,
            userId: plan.user_id,
            course: {
                id: plan.id, // course id
                code: plan.code,
                name: plan.name,
                description: plan.description,
                credits: plan.credits,
                department: plan.department,
                fullCode: plan.full_code,
                concentrationCore: plan.concentration_core,
                concentrationElective: plan.concentration_elective,
                professorId: plan.professor_id,
            },
            requirementType: plan.requirement_type,
            semester: plan.semester,
            year: plan.year,
            status: plan.status,
            notes: plan.notes,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at,
        }));

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
        } = body;

        // Create a new course plan
        const coursePlan = await sql`
            INSERT INTO course_planner (
                user_id,
                course_id,
                requirement_type,
                semester,
                year,
                status,
                notes
            )
            VALUES (
                ${session.user.id},
                ${courseId},
                ${requirementType},
                ${semester},
                ${year},
                ${status},
                ${notes}
            )
            RETURNING id
        `;

        // Fetch the created plan with course details
        const createdPlan = await sql`
            SELECT 
                cp.id as plan_id,
                cp.user_id,
                cp.course_id,
                cp.requirement_type,
                cp.semester,
                cp.year,
                cp.status,
                cp.notes,
                cp.created_at,
                cp.updated_at,
                c.id,
                c.code,
                c.name,
                c.description,
                c.credits,
                c.department,
                c.full_code,
                c.concentration_core,
                c.concentration_elective,
                c.professor_id
            FROM course_planner cp
            JOIN courses c ON cp.course_id = c.id
            WHERE cp.id = ${coursePlan[0].id}
        `;

        const transformedPlan = {
            id: createdPlan[0].plan_id,
            userId: createdPlan[0].user_id,
            course: {
                id: createdPlan[0].id,
                code: createdPlan[0].code,
                name: createdPlan[0].name,
                description: createdPlan[0].description,
                credits: createdPlan[0].credits,
                department: createdPlan[0].department,
                fullCode: createdPlan[0].full_code,
                concentrationCore: createdPlan[0].concentration_core,
                concentrationElective: createdPlan[0].concentration_elective,
                professorId: createdPlan[0].professor_id,
            },
            requirementType: createdPlan[0].requirement_type,
            semester: createdPlan[0].semester,
            year: createdPlan[0].year,
            status: createdPlan[0].status,
            notes: createdPlan[0].notes,
            createdAt: createdPlan[0].created_at,
            updatedAt: createdPlan[0].updated_at,
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
        const { id, requirementType, semester, year, status, notes } = body;

        // Update the course plan
        await sql`
            UPDATE course_planner
            SET 
                requirement_type = ${requirementType},
                semester = ${semester},
                year = ${year},
                status = ${status},
                notes = ${notes},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id} AND user_id = ${session.user.id}
        `;

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

        // Delete the course plan(s)
        if (id) {
            // Delete a specific plan by ID
            await sql`
                DELETE FROM course_planner
                WHERE id = ${id} AND user_id = ${session.user.id}
            `;
        } else if (courseId) {
            // Delete all plans for a specific course
            await sql`
                DELETE FROM course_planner
                WHERE course_id = ${courseId} AND user_id = ${session.user.id}
            `;
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
