import Link from "next/link";
import HeroVideo from "./components/HeroVideo";
import {
    BookOpen,
    Calendar,
    MessageSquare,
    ShoppingBag,
    Star,
    Link as LinkIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";

// Cache generated HTML at the edge for 60 s (Incremental Static Regeneration)
export const revalidate = 60;

export const metadata: Metadata = {
    title: {
        default: "Cornell Tech Hub | Student Community & Resources",
        template: "%s | Cornell Tech Hub",
    },
    description:
        "Cornell Tech Hub is a student-run community where you can connect with peers, share course reviews, and discover resources for your Cornell Tech journey.",
    keywords: [
        "Cornell Tech",
        "Course Reviews",
        "Student Forum",
        "Graduate School",
        "NYC Campus",
    ],
    openGraph: {
        title: "Cornell Tech Hub",
        description:
            "Connect with peers, share reviews, and discover resources for your Cornell Tech journey.",
        url: "https://cornell-tech-hub.com/",
        siteName: "Cornell Tech Hub",
        images: [
            {
                url: "/images/logo/logo.png",
                width: 1200,
                height: 630,
                alt: "Cornell Tech Hub logo",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Cornell Tech Hub",
        description:
            "Connect with peers, share reviews, and discover resources for your Cornell Tech journey.",
        images: ["/images/logo/logo.png"],
    },
    alternates: {
        canonical: "https://www.cornelltechhub.info/",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function Dashboard() {
    const sessionPromise = getServerSession(authOptions);

    let topCourses: any[] = [];
    let forumPosts: any[] = [];
    let topCourseError: string | null = null;
    let forumError: string | null = null;

    try {
        const [coursesRes, forumRes] = await Promise.allSettled([
            import("@/lib/services/courses").then(({ getAggregatedCourses }) =>
                getAggregatedCourses({ sortBy: "popular", limit: 3 })
            ),
            import("@/app/forum/actions").then(({ getForumPosts }) =>
                getForumPosts("", 3, 0)
            ),
        ]);

        if (coursesRes.status === "fulfilled") {
            topCourses = coursesRes.value.courses;
        } else {
            console.error("Error loading courses", coursesRes.reason);
            topCourseError = "Failed to load courses";
        }

        if (forumRes.status === "fulfilled") {
            forumPosts = forumRes.value.posts;
        } else {
            console.error("Error loading forum posts", forumRes.reason);
            forumError = "Failed to load forum posts";
        }
    } catch (err) {
        console.error("Unexpected error fetching homepage data", err);
    }

    const session = await sessionPromise;

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_700px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2 items-center text-center">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                                        Cornell Tech Hub
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Connect with peers, share course
                                        reviews, and discover resources for your
                                        Cornell Tech journey.
                                    </p>
                                    <p className="text-sm text-muted-foreground italic">
                                        This is a student-built independent
                                        project and is not officially affiliated
                                        with Cornell Tech.
                                    </p>
                                </div>
                            </div>
                            {/* Client-side only: video preview interaction */}
                            <HeroVideo />
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-12 md:px-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Explore Resources
                        </h2>
                    </div>
                    <div className="mt-6">
                        <div className="grid gap-6 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="w-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-red-600" />
                                        Course Reviews
                                    </CardTitle>
                                    <CardDescription>
                                        Find and share reviews for Cornell Tech
                                        courses
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        {topCourseError ? (
                                            <div className="text-red-500 text-sm">
                                                {topCourseError}
                                            </div>
                                        ) : (
                                            topCourses.map((course) => (
                                                <div
                                                    className="flex items-center justify-between"
                                                    key={course.id}
                                                >
                                                    <Link
                                                        href={`/courses/${course.id}`}
                                                        className="font-medium hover:underline max-w-[70%] truncate"
                                                        style={{
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            display: "block",
                                                        }}
                                                    >
                                                        {course.title}
                                                    </Link>
                                                    <div className="flex items-center">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i <= Math.round(course.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link href="/courses">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            View All Courses
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card className="w-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-red-600" />
                                        Student Forum
                                    </CardTitle>
                                    <CardDescription>
                                        Connect with peers and discuss academic
                                        topics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        {forumError ? (
                                            <div className="text-red-500 text-sm">
                                                {forumError}
                                            </div>
                                        ) : (
                                            forumPosts.map((post) => (
                                                <div
                                                    className="flex items-center justify-between"
                                                    key={post.id}
                                                >
                                                    <Link
                                                        href={`/forum/${post.id}`}
                                                        className="font-medium hover:underline max-w-[70%] truncate"
                                                        style={{
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            display: "block",
                                                        }}
                                                    >
                                                        {post.title}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground">
                                                        {post.reply_count}{" "}
                                                        replies
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link href="/forum">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            Join Discussions
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card className="w-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-red-600" />
                                        Useful Links
                                    </CardTitle>
                                    <CardDescription>
                                        Quick access to important Cornell Tech
                                        resources
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href="https://cornelltech.campusgroups.com/events"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                Campus Events
                                            </Link>
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href="https://cornell.joinhandshake.com/stu/postings"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                Handshake
                                            </Link>
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href="https://thehouseatcornelltech.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                The House @ Cornell Tech
                                            </Link>
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link
                                        href="https://admissions.tech.cornell.edu/dnu-admitted/resources/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            More Resources
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Only show Join the Community if not logged in */}
                {!session && (
                    <section className="container px-4 py-12 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    Join the Community
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                                    Connect with fellow students, share
                                    resources, and make the most of your Cornell
                                    Tech experience.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Link href="/auth/signup">
                                    <Button size="lg">Sign Up Now</Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
