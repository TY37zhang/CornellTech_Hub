import { NextResponse } from "next/server";
import { getAggregatedCourses } from "@/lib/services/courses";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const limit = parseInt(searchParams.get("limit") || "5", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);
        const sortBy =
            (searchParams.get("sortBy") as
                | "recent"
                | "popular"
                | "rating"
                | "difficulty"
                | "workload") || "recent";

        const { courses, total } = await getAggregatedCourses({
            search,
            category,
            limit,
            offset,
            sortBy,
        });

        return NextResponse.json({ courses, total });
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

// Helper function to get category color
function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
        ceee: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        cs: "bg-red-100 text-red-800 hover:bg-red-100",
        ece: "bg-green-100 text-green-800 hover:bg-green-100",
        hadm: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        info: "bg-purple-100 text-purple-800 hover:bg-purple-100",
        law: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
        orie: "bg-pink-100 text-pink-800 hover:bg-pink-100",
        tech: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        techie: "bg-teal-100 text-teal-800 hover:bg-teal-100",
        arch: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
        cee: "bg-lime-100 text-lime-800 hover:bg-lime-100",
        cmbp: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
        cmpb: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        ctiv: "bg-rose-100 text-rose-800 hover:bg-rose-100",
        design: "bg-violet-100 text-violet-800 hover:bg-violet-100",
        hbds: "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100",
        hinf: "bg-sky-100 text-sky-800 hover:bg-sky-100",
        hpec: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        iamp: "bg-rose-100 text-rose-800 hover:bg-rose-100",
        nba: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
        nbay: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        pbsb: "bg-green-100 text-green-800 hover:bg-green-100",
        phar: "bg-purple-100 text-purple-800 hover:bg-purple-100",
        tpcm: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    };
    return (
        colors[category] ||
        "bg-gray-100 text-gray-800 hover:bg-gray-100"
    );
}

export const revalidate = 60;
export const dynamic = "force-dynamic";
