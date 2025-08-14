import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
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

        // Create credit transfer record
        const transfer = await prisma.course_special_requirements.create({
            data: {
                user_id: user.id,
                requirement_type: "credit_transfer" as any, // We'll need to add this to the enum
                deducted_from_category: fromCategory,
                added_to_category: toCategory,
                credit_amount: creditAmount,
            },
        });

        return NextResponse.json({
            success: true,
            transfer: {
                id: transfer.id,
                fromCategory,
                toCategory,
                amount: creditAmount,
            },
        });
    } catch (error) {
        console.error("Credit transfer error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
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

        const transfers = await prisma.course_special_requirements.findMany({
            where: {
                user_id: user.id,
                requirement_type: "credit_transfer" as any,
            },
        });

        const formattedTransfers = transfers.map((t) => ({
            id: t.id,
            fromCategory: t.deducted_from_category!,
            toCategory: t.added_to_category!,
            amount: t.credit_amount,
        }));

        return NextResponse.json({ transfers: formattedTransfers });
    } catch (error) {
        console.error("Fetch credit transfers error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const transferId = searchParams.get("id");

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

        await prisma.course_special_requirements.deleteMany({
            where: {
                id: transferId,
                user_id: user.id,
                requirement_type: "credit_transfer" as any,
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
