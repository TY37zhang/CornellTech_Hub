import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

        // Perform the upsert logic in a single transaction for safety
        await prisma.$transaction(async (tx) => {
            // Delete any existing requirement of this type for the user
            await tx.course_special_requirements.deleteMany({
                where: {
                    user_id: session.user.id,
                    requirement_type: requirementType,
                },
            });

            // Insert a new row only if we're actually setting a requirement (not clearing it)
            // For clearing, we just delete (above) and don't create a new record
            if (selectedCourseId && (deductedFromCategory || addedToCategory)) {
                // Validate credit amount when provided and non-zero
                if (
                    creditAmount !== undefined &&
                    creditAmount !== null &&
                    (typeof creditAmount !== "number" || creditAmount === 0)
                ) {
                    throw new Error("Invalid credit amount");
                }

                await tx.course_special_requirements.create({
                    data: {
                        user_id: session.user.id,
                        requirement_type: requirementType,
                        selected_course_id: selectedCourseId,
                        deducted_from_category: deductedFromCategory,
                        credit_amount: creditAmount ?? undefined,
                        added_to_category: addedToCategory,
                    },
                });
            }
        });

        return new NextResponse("Success", { status: 200 });
    } catch (error) {
        console.error("Error saving course special requirement:", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Server Error",
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const requirements = await prisma.course_special_requirements.findMany({
            where: { user_id: session.user.id },
        });

        return NextResponse.json(requirements);
    } catch (error) {
        console.error("Error fetching course special requirements:", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Server Error",
            { status: 500 }
        );
    }
}
