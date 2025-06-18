import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal endpoint to collect Web Vitals emitted from the browser via
 * `app/reportWebVitals.ts`. Replace the `console.log` with your own logging,
 * analytics, or database integration.
 */
export async function POST(request: NextRequest) {
    try {
        const metric = await request.json();

        // TODO: send to your analytics pipeline (Datadog, ClickHouse, etc.)
        console.log("[WebVitals]", metric);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[WebVitals] Failed to process metric", error);
        return NextResponse.json({ ok: false }, { status: 400 });
    }
}

// Disable caching – these requests should always hit the function.
export const revalidate = 0;
