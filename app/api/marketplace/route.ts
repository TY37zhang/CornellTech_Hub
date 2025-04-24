import { NextResponse } from "next/server";
import { marketplaceOperations } from "@/lib/db/models";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");
        const sellerId = searchParams.get("sellerId");

        let items;
        if (sellerId) {
            items = await marketplaceOperations.findBySeller(sellerId);
        } else {
            items = await marketplaceOperations.findAll(limit, offset);
        }

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching marketplace items:", error);
        return NextResponse.json(
            { error: "Failed to fetch marketplace items" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const item = await marketplaceOperations.create(body);
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Error creating marketplace item:", error);
        return NextResponse.json(
            { error: "Failed to create marketplace item" },
            { status: 500 }
        );
    }
}
