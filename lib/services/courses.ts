import { prisma } from "@/lib/db/prisma";

// Helper function to get category color (kept in sync with tag colors across the app)
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

export interface CourseAggregationOptions {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
    sortBy?: "recent" | "popular" | "rating" | "difficulty" | "workload";
}

// Shared helper used by both API routes and server components for course aggregation.
export async function getAggregatedCourses(
    options: CourseAggregationOptions = {}
): Promise<{ courses: any[]; total: number }> {
    const {
        search = "",
        category = "",
        limit = 5,
        offset = 0,
        sortBy = "rating",
    } = options;

    // 1. Fetch _some_ course rows from the DB instead of the entire table.
    //    We over-fetch a small multiple of `limit` to keep diversity but avoid hundreds of rows.
    const preSample = limit * 20; // e.g. homepage limit=3 → fetch at most 60 rows

    const coursesRaw = await prisma.courses.findMany({
        where: {
            AND: [
                search
                    ? {
                          OR: [
                              {
                                  name: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  professor_id: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  code: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                              {
                                  department: {
                                      contains: search,
                                      mode: "insensitive",
                                  },
                              },
                          ],
                      }
                    : {},
                category
                    ? {
                          department: {
                              contains: category,
                              mode: "insensitive",
                          },
                      }
                    : {},
            ],
        },
        orderBy: {
            created_at: "desc", // cheap index – gives recent entries first
        },
        take: preSample,
        include: {
            course_reviews: {
                select: {
                    overall_rating: true,
                    rating: true, // value
                    difficulty: true,
                    workload: true,
                    content: true,
                    created_at: true,
                },
            },
        },
    });

    // 2. Group by course name only to combine courses with different professors
    const groupMap = new Map<string, typeof coursesRaw>();
    for (const course of coursesRaw) {
        const key = course.name;
        if (!groupMap.has(key)) {
            groupMap.set(key, [] as any);
        }
        (groupMap.get(key) as any).push(course);
    }

    const groups = Array.from(groupMap.values());

    // Helper to compute average rounded to 1 decimal
    const avg = (nums: number[]) => {
        if (nums.length === 0) return 0;
        const sum = nums.reduce((a, b) => a + b, 0);
        return Math.round((sum / nums.length) * 10) / 10;
    };

    // 3. Build aggregated representation for each group
    const aggregated = groups.map((group) => {
        const reviews = group.flatMap((c) => c.course_reviews);

        const reviewCount = reviews.length;

        const ratings = reviews
            .map((r) =>
                r.overall_rating !== null && r.overall_rating !== undefined
                    ? Number(r.overall_rating)
                    : (r.rating ?? null)
            )
            .filter((n): n is number => n !== null);

        const difficulties = reviews
            .map((r) => r.difficulty)
            .filter((n): n is number => n !== null);
        const workloads = reviews
            .map((r) => r.workload)
            .filter((n): n is number => n !== null);
        const values = reviews
            .map((r) => r.rating)
            .filter((n): n is number => n !== null);

        const latestReview = reviews.sort(
            (a, b) =>
                (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0)
        )[0];

        const codes = group.map((c) => c.code).sort();
        const departments = Array.from(
            new Set(group.map((c) => c.department))
        ).sort();
        const professors = Array.from(
            new Set(group.map((c) => c.professor_id).filter(Boolean))
        ).sort();

        const primaryCourse = group[0];

        return {
            id: codes[0],
            title: primaryCourse.name,
            professor:
                professors.length > 0
                    ? professors.join(", ")
                    : "Unknown Professor",
            category: departments[0]?.toLowerCase() || "",
            rating: avg(ratings),
            reviewCount,
            difficulty: avg(difficulties),
            workload: avg(workloads),
            value: avg(values),
            review: latestReview?.content || "No reviews yet",
            categoryColor: getCategoryColor(departments[0]?.toLowerCase()),
            crossListed:
                codes.length > 1
                    ? {
                          codes,
                          departments,
                      }
                    : null,
            _sortKeys: {
                recent: latestReview?.created_at ?? new Date(0),
                popular: reviewCount,
            },
        } as any;
    });

    // 4. Sort according to requested strategy
    const sortStrategies: Record<string, (a: any, b: any) => number> = {
        recent: (a, b) =>
            (b._sortKeys.recent as Date).getTime() -
            (a._sortKeys.recent as Date).getTime(),
        popular: (a, b) => b.reviewCount - a.reviewCount,
        rating: (a, b) => b.rating - a.rating,
        difficulty: (a, b) => b.difficulty - a.difficulty,
        workload: (a, b) => b.workload - a.workload,
    };

    const sortFn = sortStrategies[sortBy] ?? sortStrategies["rating"];
    aggregated.sort(sortFn);

    // 5. Pagination
    const totalCount = aggregated.length;
    const paginated = aggregated.slice(offset, offset + limit);

    return { courses: paginated, total: totalCount };
}
