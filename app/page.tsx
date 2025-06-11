"use client";

import Link from "next/link";
import Image from "next/image";
import {
    BookOpen,
    Calendar,
    MessageSquare,
    ShoppingBag,
    Star,
    TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function Dashboard() {
    const { data: session, status } = useSession();
    // Add state for top courses
    const [topCourses, setTopCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Forum posts state
    const [forumPosts, setForumPosts] = useState<any[]>([]);
    const [forumLoading, setForumLoading] = useState(true);
    const [forumError, setForumError] = useState<string | null>(null);

    // Video preview state
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const fetchTopCourses = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/courses?sortBy=popular&limit=3");
                if (!res.ok) throw new Error("Failed to fetch courses");
                const data = await res.json();
                setTopCourses(data.courses);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchTopCourses();
    }, []);

    useEffect(() => {
        const fetchForumPosts = async () => {
            try {
                setForumLoading(true);
                setForumError(null);
                const res = await fetch("/api/forum/posts?limit=3");
                if (!res.ok) throw new Error("Failed to fetch forum posts");
                const data = await res.json();
                if (!data.success)
                    throw new Error(
                        data.error || "Failed to fetch forum posts"
                    );
                setForumPosts(data.posts);
            } catch (err) {
                setForumError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setForumLoading(false);
            }
        };
        fetchForumPosts();
    }, []);

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
                                    <p className="text-sm text-muted-foreground italic">
                                        This is a student-built independent
                                        project and is not officially affiliated
                                        with Cornell Tech.
                                    </p>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Connect with peers, share course
                                        reviews, and discover resources for your
                                        Cornell Tech journey.
                                    </p>
                                </div>
                                {/* <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button size="lg">Explore Resources</Button>
                                    <Button variant="outline" size="lg">
                                        Learn More
                                    </Button>
                                </div> */}
                            </div>
                            <div className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last relative">
                                {showVideo ? (
                                    <video
                                        ref={videoRef}
                                        src="/videos/We%20are%20Cornell%20Tech.mp4"
                                        muted
                                        playsInline
                                        autoPlay
                                        className="w-full h-full object-cover"
                                        onCanPlay={() =>
                                            videoRef.current?.play()
                                        }
                                        onEnded={() => setShowVideo(false)}
                                    />
                                ) : (
                                    <Image
                                        src="/images/DJI_0440.jpg"
                                        alt="Cornell Tech Campus Preview"
                                        fill
                                        className="object-cover w-full h-full cursor-pointer"
                                        style={{ zIndex: 1 }}
                                        onClick={() => setShowVideo(true)}
                                    />
                                )}
                            </div>
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
                                        {loading ? (
                                            <div className="text-muted-foreground text-sm">
                                                Loading...
                                            </div>
                                        ) : error ? (
                                            <div className="text-red-500 text-sm">
                                                {error}
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
                                        {forumLoading ? (
                                            <div className="text-muted-foreground text-sm">
                                                Loading...
                                            </div>
                                        ) : forumError ? (
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
                            {/* Marketplace Card - Temporarily Disabled
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-red-600" />
                                        Marketplace
                                    </CardTitle>
                                    <CardDescription>
                                        Buy and sell items within the Cornell
                                        Tech community
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                MacBook Pro (2022)
                                            </span>
                                            <span className="text-xs font-medium">
                                                $1,200
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Textbooks Bundle
                                            </span>
                                            <span className="text-xs font-medium">
                                                $85
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                Desk Chair
                                            </span>
                                            <span className="text-xs font-medium">
                                                $50
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Link href="/marketplace">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Browse Marketplace
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                            */}
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
                                {/* <Button variant="outline" size="lg">
                                Learn More
                            </Button> */}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
