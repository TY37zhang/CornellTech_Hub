import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const courseId = resolvedParams.id;

        // Fetch the course's name by code using Prisma
        const base = await prisma.courses.findFirst({
            where: { code: courseId },
            select: { name: true },
        });
        if (!base) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }
        const { name } = base;

        // Fetch ALL courses with this name (across all professors and terms)
        const allCourseInstances = await prisma.courses.findMany({
            where: { name: { equals: name, mode: "insensitive" } },
            select: {
                id: true,
                code: true,
                name: true,
                department: true,
                professor_id: true,
                semester: true,
                year: true,
                credits: true,
                course_reviews: {
                    select: {
                        overall_rating: true,
                        difficulty: true,
                        workload: true,
                        rating: true,
                        created_at: true,
                    },
                },
            },
        });

        if (allCourseInstances.length === 0) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Helper function for averaging
        const avg = (arr: number[]) =>
            arr.length === 0
                ? null
                : Math.round(
                      (arr.reduce((a, b) => a + b, 0) / arr.length) * 10
                  ) / 10;

        // Aggregate data across ALL professors and terms
        const allReviews = allCourseInstances.flatMap(
            (course) => course.course_reviews
        );
        const codes = [...new Set(allCourseInstances.map((c) => c.code))];
        const departments = [
            ...new Set(
                allCourseInstances
                    .map((c) => c.department)
                    .filter(Boolean)
                    .map((dept) => dept.trim().toUpperCase())
            ),
        ];

        const professors = [
            ...new Set(
                allCourseInstances.map((c) => c.professor_id).filter(Boolean)
            ),
        ];
        const terms = [
            ...new Set(
                allCourseInstances.map((c) => `${c.semester} ${c.year}`)
            ),
        ];

        // Calculate overall aggregated metrics
        const overallRating = avg(
            allReviews
                .map((r) =>
                    r.overall_rating !== null && r.overall_rating !== undefined
                        ? Number(r.overall_rating)
                        : (r.rating ?? null)
                )
                .filter((n): n is number => n !== null)
        );

        const overallDifficulty = avg(
            allReviews
                .map((r) => r.difficulty)
                .filter((n): n is number => n !== null)
        );

        const overallWorkload = avg(
            allReviews
                .map((r) => r.workload)
                .filter((n): n is number => n !== null)
        );

        const overallValue = avg(
            allReviews
                .map((r) => r.rating)
                .filter((n): n is number => n !== null)
        );

        // Group by professor for detailed breakdown
        const professorData = professors.map((prof) => {
            const profCourses = allCourseInstances.filter(
                (c) => c.professor_id === prof
            );
            const profReviews = profCourses.flatMap((c) => c.course_reviews);
            const profTerms = [
                ...new Set(profCourses.map((c) => `${c.semester} ${c.year}`)),
            ];

            return {
                name: prof || "Unknown Professor",
                reviewCount: profReviews.length,
                rating: avg(
                    profReviews
                        .map((r) =>
                            r.overall_rating !== null &&
                            r.overall_rating !== undefined
                                ? Number(r.overall_rating)
                                : (r.rating ?? null)
                        )
                        .filter((n): n is number => n !== null)
                ),
                difficulty: avg(
                    profReviews
                        .map((r) => r.difficulty)
                        .filter((n): n is number => n !== null)
                ),
                workload: avg(
                    profReviews
                        .map((r) => r.workload)
                        .filter((n): n is number => n !== null)
                ),
                value: avg(
                    profReviews
                        .map((r) => r.rating)
                        .filter((n): n is number => n !== null)
                ),
                terms: profTerms.sort(),
            };
        });

        // Fetch ALL reviews for the course with user details
        const courseIds = allCourseInstances.map((c) => c.id);
        const reviewsResult = await prisma.course_reviews.findMany({
            where: { course_id: { in: courseIds } },
            include: {
                users: { select: { id: true, name: true, avatar_url: true } },
                courses: {
                    select: { professor_id: true, semester: true, year: true },
                },
            },
            orderBy: { created_at: "desc" },
        });

        // Use the first course instance as reference for basic info
        const primaryCourse = allCourseInstances[0];

        // Transform the data
        const transformedCourse = {
            id: codes[0],
            code: codes[0],
            codes: codes, // Add all codes for display
            title: primaryCourse.name,
            professor:
                professors.length === 1
                    ? professors[0] || "Unknown Professor"
                    : `${professors.length} professors`,
            professors: professorData, // Detailed professor breakdown
            departments: departments,
            semester: primaryCourse.semester,
            year: primaryCourse.year,
            credits: primaryCourse.credits,
            rating: Number(overallRating) || 0,
            reviewCount: allReviews.length,
            difficulty: Number(overallDifficulty) || 0,
            workload: Number(overallWorkload) || 0,
            value: Number(overallValue) || 0,
            categoryColor: getCategoryColor(departments[0]?.toLowerCase()),
            terms: terms.sort(),
            reviews: reviewsResult.map((review: any) => ({
                id: review.id,
                content: review.content,
                rating: Number(review.overall_rating ?? review.rating) || 0,
                difficulty: Number(review.difficulty) || 0,
                workload: Number(review.workload) || 0,
                value: Number(review.rating) || 0,
                grade: (review as any).grade ?? undefined,
                createdAt: review.created_at,
                author: review.users?.name ?? "Anonymous",
                authorId: review.users?.id ?? null,
                avatarUrl: review.users?.avatar_url ?? null,
                professor: review.courses?.professor_id || "Unknown Professor",
                term: `${review.courses?.semester || ""} ${review.courses?.year || ""}`.trim(),
            })),
        };

        return NextResponse.json(transformedCourse);
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json(
            { error: "Failed to fetch course" },
            { status: 500 }
        );
    }
}

// Helper function to get category color
function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
        ceee: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        cs: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        ece: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        hadm: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-800/20 dark:text-yellow-400",
        info: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
        law: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-800/20 dark:text-indigo-400",
        orie: "bg-pink-100 text-pink-800 hover:bg-pink-100 dark:bg-pink-800/20 dark:text-pink-400",
        tech: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-800/20 dark:text-orange-400",
        techie: "bg-teal-100 text-teal-800 hover:bg-teal-100 dark:bg-teal-800/20 dark:text-teal-400",
        arch: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-800/20 dark:text-cyan-400",
        cee: "bg-lime-100 text-lime-800 hover:bg-lime-100 dark:bg-lime-800/20 dark:text-lime-400",
        cmbp: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-800/20 dark:text-emerald-400",
        cmpb: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        ctiv: "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-800/20 dark:text-rose-400",
        design: "bg-violet-100 text-violet-800 hover:bg-violet-100 dark:bg-violet-800/20 dark:text-violet-400",
        hbds: "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100 dark:bg-fuchsia-800/20 dark:text-fuchsia-400",
        hinf: "bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-800/20 dark:text-sky-400",
        hpec: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        iamp: "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-800/20 dark:text-rose-400",
        nba: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-800/20 dark:text-indigo-400",
        nbay: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        pbsb: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        phar: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
        tpcm: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-800/20 dark:text-orange-400",
    };
    return (
        colors[category] ||
        "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/20 dark:text-gray-400"
    );
}
