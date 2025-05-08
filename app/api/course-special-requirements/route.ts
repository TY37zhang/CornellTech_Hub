import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db/utils";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            requirementType,
            selectedCourseId,
            deductedFromCategory,
            creditAmount,
            addedToCategory,
        } = body;

        // Validate required fields
        if (!requirementType) {
            return new NextResponse("Requirement type is required", {
                status: 400,
            });
        }

        // Validate requirement type
        if (!["ethics_course", "techie_5901"].includes(requirementType)) {
            return new NextResponse("Invalid requirement type", {
                status: 400,
            });
        }

        // Start transaction
        await executeQuery("BEGIN");

        try {
            // First delete any existing requirements of this type for the user
            await executeQuery(
                `DELETE FROM course_special_requirements 
                 WHERE user_id = $1 AND requirement_type = $2`,
                [session.user.id, requirementType]
            );

            // Then insert the new requirement if it exists
            if (selectedCourseId || deductedFromCategory || addedToCategory) {
                // Validate credit amount
                if (
                    creditAmount &&
                    (typeof creditAmount !== "number" || creditAmount === 0)
                ) {
                    throw new Error("Invalid credit amount");
                }

                await executeQuery(
                    `INSERT INTO course_special_requirements 
                     (user_id, requirement_type, selected_course_id, deducted_from_category, credit_amount, added_to_category)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        session.user.id,
                        requirementType,
                        selectedCourseId,
                        deductedFromCategory,
                        creditAmount,
                        addedToCategory,
                    ]
                );
            }

            // Commit transaction
            await executeQuery("COMMIT");
            return new NextResponse("Success", { status: 200 });
        } catch (error) {
            // Rollback transaction on error
            await executeQuery("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error("Error saving course special requirement:", error);
        // Return the error message to the client for better debugging
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Server Error",
            {
                status: 500,
            }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const result = await executeQuery(
            `SELECT * FROM course_special_requirements WHERE user_id = $1`,
            [session.user.id]
        );

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching course special requirements:", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Server Error",
            {
                status: 500,
            }
        );
    }
}
