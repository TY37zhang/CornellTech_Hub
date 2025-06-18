/* eslint-disable @next/next/no-async-client-component */
// This file is now a SERVER component.
import CoursesClient from "./CoursesClient.tsx";

export const revalidate = 1800; // Incremental static regeneration every 30 min

async function getInitialCourses() {
    const limit = 15;
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/courses?limit=${limit}&offset=0`, {
        // Cache at build time and revalidate per the setting above
        next: { revalidate: 1800 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch initial courses");
    }

    return (await res.json()) as { courses: any[]; total: number };
}

export default async function CoursesPage() {
    const { courses, total } = await getInitialCourses();
    return <CoursesClient initialCourses={courses} initialTotal={total} />;
}
