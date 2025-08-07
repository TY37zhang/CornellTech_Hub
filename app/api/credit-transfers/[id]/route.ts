import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: transferId } = await params;
        if (!transferId) {
            return NextResponse.json(
                { error: "Transfer ID required" },
                { status: 400 }
            );
        }

        const { fromCategory, toCategory, creditAmount } = await request.json();

        if (!fromCategory || !toCategory || !creditAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (creditAmount <= 0) {
            return NextResponse.json(
                { error: "Credit amount must be positive" },
                { status: 400 }
            );
        }

        if (fromCategory === toCategory) {
            return NextResponse.json(
                { error: "Source and destination must be different" },
                { status: 400 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Verify the transfer exists and belongs to the user
        const existingTransfer =
            await prisma.course_special_requirements.findFirst({
                where: {
                    id: transferId,
                    user_id: user.id,
                    requirement_type: "credit_transfer" as any,
                },
            });

        if (!existingTransfer) {
            return NextResponse.json(
                { error: "Transfer not found or access denied" },
                { status: 404 }
            );
        }

        // Update the credit transfer record
        const updatedTransfer = await prisma.course_special_requirements.update(
            {
                where: {
                    id: transferId,
                },
                data: {
                    deducted_from_category: fromCategory,
                    added_to_category: toCategory,
                    credit_amount: creditAmount,
                },
            }
        );

        return NextResponse.json({
            success: true,
            transfer: {
                id: updatedTransfer.id,
                fromCategory,
                toCategory,
                amount: creditAmount,
            },
        });
    } catch (error) {
        console.error("Update credit transfer error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: transferId } = await params;
        if (!transferId) {
            return NextResponse.json(
                { error: "Transfer ID required" },
                { status: 400 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Verify the transfer exists and belongs to the user before deleting
        const existingTransfer =
            await prisma.course_special_requirements.findFirst({
                where: {
                    id: transferId,
                    user_id: user.id,
                    requirement_type: "credit_transfer" as any,
                },
            });

        if (!existingTransfer) {
            return NextResponse.json(
                { error: "Transfer not found or access denied" },
                { status: 404 }
            );
        }

        // Delete the transfer
        await prisma.course_special_requirements.delete({
            where: {
                id: transferId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete credit transfer error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
