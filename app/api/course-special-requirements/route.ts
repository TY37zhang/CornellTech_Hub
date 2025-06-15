import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.log("Unauthorized request - no valid session or user ID");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        console.log("Received POST request body:", body);

        const {
            requirementType,
            selectedCourseId,
            deductedFromCategory,
            creditAmount,
            addedToCategory,
        } = body;

        // Validate required fields
        if (!requirementType) {
            console.log("Missing required field: requirementType");
            return new NextResponse("Requirement type is required", {
                status: 400,
            });
        }

        // Validate requirement type
        if (!["ethics_course", "techie_5901"].includes(requirementType)) {
            console.log("Invalid requirement type:", requirementType);
            return new NextResponse("Invalid requirement type", {
                status: 400,
            });
        }

        // Defensive: always provide a valid credit amount
        const safeCreditAmount =
            typeof creditAmount === "number" ? creditAmount : -1;

        console.log("Starting database transaction with params:", {
            userId: session.user.id,
            requirementType,
            selectedCourseId,
            deductedFromCategory,
            safeCreditAmount,
            addedToCategory,
        });

        // NOTE: Transaction safety is not guaranteed with executeQuery abstraction.
        // For true transaction support, refactor to use a single client connection.
        await executeQuery("BEGIN");

        try {
            // First delete any existing requirements of this type for the user
            console.log("Deleting existing requirements...");
            await executeQuery(
                `DELETE FROM course_special_requirements 
                 WHERE user_id = $1 AND requirement_type = $2`,
                [session.user.id, requirementType]
            );

            // Then insert the new requirement if it exists
            if (selectedCourseId || deductedFromCategory || addedToCategory) {
                // Validate credit amount
                if (typeof safeCreditAmount !== "number") {
                    throw new Error("Invalid credit amount");
                }

                console.log("Inserting new requirement...");
                await executeQuery(
                    `INSERT INTO course_special_requirements 
                     (user_id, requirement_type, selected_course_id, deducted_from_category, credit_amount, added_to_category)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        session.user.id,
                        requirementType,
                        selectedCourseId,
                        deductedFromCategory,
                        safeCreditAmount,
                        addedToCategory,
                    ]
                );
            }

            // Commit transaction
            console.log("Committing transaction...");
            await executeQuery("COMMIT");
            return new NextResponse("Success", { status: 200 });
        } catch (error) {
            // Rollback transaction on error
            console.error("Error during transaction, rolling back:", error);
            await executeQuery("ROLLBACK");
            throw error;
        }
    } catch (error: unknown) {
        console.error("Error saving course special requirement:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            code: (error as any).code,
        });
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
        console.log("Processing GET request for course special requirements");
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.log("Unauthorized request - no valid session or user ID");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        console.log("Fetching requirements for user:", session.user.id);
        const result = await executeQuery(
            `SELECT * FROM course_special_requirements WHERE user_id = $1`,
            [session.user.id]
        );

        console.log("Successfully fetched requirements:", result);
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Error fetching course special requirements:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            code: (error as any).code,
        });
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Server Error",
            {
                status: 500,
            }
        );
    }
}
