/* eslint-disable @next/next/no-async-client-component */
// This file is now a SERVER component.
import CoursesClient from "./CoursesClient.tsx";
import { getAggregatedCourses } from "@/lib/services/courses";

export const revalidate = 1800; // Incremental static regeneration every 30 min

async function getInitialCourses() {
    const limit = 15;
    try {
        return await getAggregatedCourses({
            limit,
            offset: 0,
            sortBy: "rating",
        });
    } catch (error) {
        // If the DB is unreachable for some reason, fallback so the page still builds.
        console.error("Failed to load courses from DB: ", error);
        return { courses: [], total: 0 };
    }
}

export default async function CoursesPage() {
    const { courses, total } = await getInitialCourses();
    return <CoursesClient initialCourses={courses} initialTotal={total} />;
}
