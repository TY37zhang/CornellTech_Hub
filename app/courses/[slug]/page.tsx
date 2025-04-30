"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Star,
    ThumbsDown,
    ThumbsUp,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Define course type
interface Review {
    id: string;
    content: string;
    rating: number;
    difficulty: number;
    workload: number;
    value: number;
    createdAt: string;
    author: string;
    avatarUrl: string | null;
}

interface Course {
    id: string;
    title: string;
    professor: string;
    category: string;
    semester: string;
    year: number;
    credits: number;
    rating: number;
    reviewCount: number;
    difficulty: number;
    workload: number;
    value: number;
    categoryColor: string;
    reviews: Review[];
    description?: string;
    syllabus?: string;
    ratings?: Record<string, number>;
    departments?: string[];
    updatedAt: string;
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

// Add helper function for relative time
function getRelativeTimeString(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diffInMilliseconds = now.getTime() - past.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0)
        return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
    if (diffInMonths > 0)
        return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    if (diffInWeeks > 0)
        return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
    if (diffInDays > 0)
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    if (diffInHours > 0)
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInMinutes > 0)
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    return "just now";
}

// Add this function after the getRelativeTimeString function
function calculateAverages(reviews: Review[]) {
    if (!reviews.length) {
        return {
            rating: 0,
            difficulty: 0,
            workload: 0,
            value: 0,
        };
    }

    const sums = reviews.reduce(
        (acc, review) => ({
            rating: acc.rating + review.rating,
            difficulty: acc.difficulty + review.difficulty,
            workload: acc.workload + review.workload,
            value: acc.value + review.value,
        }),
        { rating: 0, difficulty: 0, workload: 0, value: 0 }
    );

    return {
        rating: Number((sums.rating / reviews.length).toFixed(1)),
        difficulty: Number((sums.difficulty / reviews.length).toFixed(1)),
        workload: Number((sums.workload / reviews.length).toFixed(1)),
        value: Number((sums.value / reviews.length).toFixed(1)),
    };
}

export default function CourseDetailPage() {
    const params = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/courses/${params.slug}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch course");
                }
                const data = await response.json();

                // Add default values for missing properties
                const courseWithDefaults = {
                    ...data,
                    description:
                        data.description ||
                        "This course provides an introduction to key concepts and techniques in the field. Students will learn fundamental principles and practical applications through lectures, assignments, and projects.",
                    syllabus:
                        data.syllabus ||
                        "The course syllabus will be available at the beginning of the semester.",
                    ratings: data.ratings || {
                        "5": Math.floor(data.reviewCount * 0.6),
                        "4": Math.floor(data.reviewCount * 0.25),
                        "3": Math.floor(data.reviewCount * 0.1),
                        "2": Math.floor(data.reviewCount * 0.03),
                        "1": Math.floor(data.reviewCount * 0.02),
                    },
                };

                setCourse(courseWithDefaults);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [params.slug]);

    // Add this after setting the course state in useEffect
    useEffect(() => {
        if (course?.reviews) {
            const averages = calculateAverages(course.reviews);
            setCourse((prev) => ({
                ...prev!,
                rating: averages.rating,
                difficulty: averages.difficulty,
                workload: averages.workload,
                value: averages.value,
                reviewCount: course.reviews.length,
            }));
        }
    }, [course?.reviews]);

    // Helper to render stars
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-4 w-4 ${
                        i <= Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-muted text-muted-foreground"
                    }`}
                />
            );
        }
        return stars;
    };

    if (isLoading) {
        return (
            <div className="container px-4 py-8 md:px-6">
                <div className="flex flex-col space-y-4">
                    <div className="h-8 w-1/4 bg-muted rounded animate-pulse" />
                    <div className="h-12 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container px-4 py-8 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-red-500">
                        {error || "Course not found"}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col gap-4">
                            <div className="w-full">
                                <div className="flex items-center justify-start">
                                    <Link
                                        href="/courses"
                                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to courses</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {Array.from(
                                                new Set(
                                                    course.departments || []
                                                )
                                            )?.map((dept, index) => (
                                                <Badge
                                                    key={index}
                                                    variant={
                                                        dept.toLowerCase() as any
                                                    }
                                                    className="min-w-[56px] justify-center text-center"
                                                >
                                                    {dept.toUpperCase()}
                                                </Badge>
                                            ))}
                                        </div>
                                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                            {course.title.split(", ")[0]}
                                        </h1>
                                        <p className="text-muted-foreground">
                                            {course.professor}
                                        </p>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="flex items-center">
                                                {renderStars(course.rating)}
                                                <span className="ml-2">
                                                    {course.rating
                                                        ? course.rating.toFixed(
                                                              1
                                                          )
                                                        : "0.0"}
                                                </span>
                                            </div>
                                            <span>
                                                ({course.reviewCount || 0}{" "}
                                                review
                                                {course.reviewCount !== 1
                                                    ? "s"
                                                    : ""}
                                                )
                                            </span>
                                            <BookOpen className="h-4 w-4 ml-2" />
                                            <span>
                                                {course.credits || 0} Credit
                                                {course.credits !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>
                                            <Calendar className="h-4 w-4 ml-2" />
                                            <span>
                                                {course.semester} {course.year}{" "}
                                                •{" "}
                                                {getRelativeTimeString(
                                                    course.updatedAt
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle>
                                            Course Rating Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        Overall
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex">
                                                        {renderStars(
                                                            course.rating
                                                        )}
                                                    </div>
                                                    <span className="font-medium">
                                                        {course.rating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Difficulty
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-24 rounded-full bg-muted">
                                                            <div
                                                                className="h-2 rounded-full bg-yellow-400"
                                                                style={{
                                                                    width: `${(course.difficulty / 5) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span>
                                                            {course.difficulty.toFixed(
                                                                1
                                                            )}
                                                            /5
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Workload
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-24 rounded-full bg-muted">
                                                            <div
                                                                className="h-2 rounded-full bg-yellow-400"
                                                                style={{
                                                                    width: `${(course.workload / 5) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span>
                                                            {course.workload.toFixed(
                                                                1
                                                            )}
                                                            /5
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Value
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-24 rounded-full bg-muted">
                                                            <div
                                                                className="h-2 rounded-full bg-yellow-400"
                                                                style={{
                                                                    width: `${(course.value / 5) * 100}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span>
                                                            {course.value.toFixed(
                                                                1
                                                            )}
                                                            /5
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Link
                                            href={`/courses/new-review?courseId=${
                                                course.id
                                            }&courseName=${encodeURIComponent(
                                                course.title
                                            )}&courseCode=${encodeURIComponent(
                                                course.id
                                            )}&professor=${encodeURIComponent(
                                                course.professor
                                            )}&category=${(course.departments?.[0] || "").toLowerCase()}`}
                                        >
                                            <Button className="w-full">
                                                Write a Review
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="inline-flex h-10 items-center gap-6 justify-start rounded-none border-b bg-transparent p-0">
                            <TabsTrigger
                                value="overview"
                                className="relative px-0 pb-4 text-base data-[state=active]:text-foreground data-[state=active]:font-semibold text-muted-foreground hover:text-foreground before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] data-[state=active]:before:bg-foreground before:content-['']"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="relative px-0 pb-4 text-base data-[state=active]:text-foreground data-[state=active]:font-semibold text-muted-foreground hover:text-foreground before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] data-[state=active]:before:bg-foreground before:content-['']"
                            >
                                Reviews
                            </TabsTrigger>
                            <TabsTrigger
                                value="syllabus"
                                className="relative px-0 pb-4 text-base data-[state=active]:text-foreground data-[state=active]:font-semibold text-muted-foreground hover:text-foreground before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] data-[state=active]:before:bg-foreground before:content-['']"
                            >
                                Syllabus
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="pt-6">
                            <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold tracking-tight">
                                            Course Description
                                        </h2>
                                        <p className="text-muted-foreground">
                                            {course.description}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold tracking-tight">
                                            What You'll Learn
                                        </h3>
                                        <ul className="list-disc pl-6 text-muted-foreground">
                                            <li>
                                                Fundamental concepts in{" "}
                                                {(
                                                    course.departments?.[0] ||
                                                    ""
                                                ).toLowerCase()}{" "}
                                                and their applications
                                            </li>
                                            <li>
                                                Practical skills and
                                                methodologies relevant to the
                                                field
                                            </li>
                                            <li>
                                                Critical thinking and
                                                problem-solving approaches
                                            </li>
                                            <li>
                                                Industry-standard tools and
                                                technologies
                                            </li>
                                            <li>
                                                How to evaluate and apply{" "}
                                                {(
                                                    course.departments?.[0] ||
                                                    ""
                                                ).toLowerCase()}{" "}
                                                principles
                                            </li>
                                            <li>
                                                Real-world applications and case
                                                studies
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold tracking-tight">
                                            Prerequisites
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Basic knowledge of{" "}
                                            {(
                                                course.departments?.[0] || ""
                                            ).toLowerCase()}{" "}
                                            concepts is recommended. Programming
                                            experience may be helpful but is not
                                            required for all sections.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle>
                                                Rating Distribution
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map(
                                                    (rating) => {
                                                        const count =
                                                            course.reviews.filter(
                                                                (r) =>
                                                                    Math.round(
                                                                        r.rating
                                                                    ) === rating
                                                            ).length;
                                                        return (
                                                            <div
                                                                key={rating}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <div className="flex w-8 items-center justify-end">
                                                                    <span className="text-base">
                                                                        {rating}
                                                                    </span>
                                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                                                                </div>
                                                                <Progress
                                                                    value={
                                                                        course.reviewCount >
                                                                        0
                                                                            ? (count /
                                                                                  course.reviewCount) *
                                                                              100
                                                                            : 0
                                                                    }
                                                                    className="h-2"
                                                                    indicatorClassName="bg-yellow-400"
                                                                />
                                                                <div className="w-8 text-right">
                                                                    <span className="text-base text-muted-foreground">
                                                                        {count}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="reviews" className="pt-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        Course Reviews
                                    </h2>
                                    <Link
                                        href={`/courses/new-review?courseId=${
                                            course.id
                                        }&courseName=${encodeURIComponent(
                                            course.title
                                        )}&courseCode=${encodeURIComponent(
                                            course.id
                                        )}&professor=${encodeURIComponent(
                                            course.professor
                                        )}&category=${(course.departments?.[0] || "").toLowerCase()}`}
                                    >
                                        <Button className="w-full">
                                            Write a Review
                                        </Button>
                                    </Link>
                                </div>
                                {course.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {course.reviews.map((review) => (
                                            <Card key={review.id}>
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <Avatar>
                                                                <AvatarImage
                                                                    src={
                                                                        review.avatarUrl ||
                                                                        undefined
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {review.author.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-medium leading-none">
                                                                    {
                                                                        review.author
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(
                                                                        review.createdAt
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            {renderStars(
                                                                review.rating
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">
                                                        {review.content}
                                                    </p>
                                                    <div className="mt-4 flex flex-wrap gap-4">
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-sm font-medium">
                                                                Difficulty:
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {
                                                                    review.difficulty
                                                                }
                                                                /5
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-sm font-medium">
                                                                Workload:
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {
                                                                    review.workload
                                                                }
                                                                /5
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-sm font-medium">
                                                                Value:
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {review.value}/5
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4 py-12">
                                        <p className="text-center text-muted-foreground">
                                            No reviews yet. Be the first to
                                            review this course!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>
            </div>
        </div>
    );
}
