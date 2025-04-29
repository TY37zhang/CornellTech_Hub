import { NextResponse } from "next/server";
import { getForumPosts } from "@/app/forum/actions";
import { isDatabaseConnected, testDatabaseConnection } from "@/lib/db";

export async function GET(request: Request) {
    try {
        // Check database connection first
        if (!isDatabaseConnected()) {
            console.log(
                "Database connection not detected, testing connection..."
            );
            const isConnected = await testDatabaseConnection();
            if (!isConnected) {
                console.error("Database connection test failed");
                return NextResponse.json(
                    {
                        success: false,
                        error: "Database connection not available. Please try again later.",
                    },
                    { status: 503 }
                );
            }
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        // Validate parameters
        if (isNaN(limit) || limit < 0 || limit > 100) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid limit parameter",
                },
                { status: 400 }
            );
        }

        if (isNaN(offset) || offset < 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid offset parameter",
                },
                { status: 400 }
            );
        }

        console.log("Fetching forum posts with params:", {
            search,
            limit,
            offset,
        });
        const postsData = await getForumPosts(search, limit, offset);

        if (!postsData || !postsData.posts) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No posts found",
                },
                { status: 404 }
            );
        }

        console.log("Successfully fetched forum posts:", {
            total: postsData.total,
            count: postsData.posts.length,
        });

        return NextResponse.json({ success: true, ...postsData });
    } catch (error) {
        console.error("Error fetching forum posts:", error);

        // Determine the appropriate error message and status code
        let errorMessage = "Failed to fetch forum posts";
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message.includes("database")) {
                errorMessage = `Database error: ${error.message}`;
                statusCode = 503;
            } else if (error.message.includes("invalid")) {
                errorMessage = error.message;
                statusCode = 400;
            }
            console.error("Error details:", {
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: statusCode }
        );
    }
}
