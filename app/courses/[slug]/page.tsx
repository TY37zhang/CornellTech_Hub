"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Clock,
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
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/courses">
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="sr-only">
                                            Back to courses
                                        </span>
                                    </Link>
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Back to courses
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={course.categoryColor}
                                                variant="secondary"
                                            >
                                                {course.category.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                            {course.title}
                                        </h1>
                                        <p className="text-muted-foreground">
                                            {course.professor}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {renderStars(course.rating)}
                                            </div>
                                            <span className="font-medium">
                                                {course.rating.toFixed(1)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                ({course.reviewCount} reviews)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {course.credits} Credits
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {course.semester} {course.year}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                ~
                                                {Math.round(
                                                    course.workload * 2
                                                )}{" "}
                                                hours/week
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
                                                                    width: `${
                                                                        course.difficulty *
                                                                        20
                                                                    }%`,
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
                                                                    width: `${
                                                                        course.workload *
                                                                        20
                                                                    }%`,
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
                                                                    width: `${
                                                                        course.value *
                                                                        20
                                                                    }%`,
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
                                        <Button className="w-full">
                                            Write a Review
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                            <TabsTrigger
                                value="overview"
                                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                            >
                                Reviews
                            </TabsTrigger>
                            <TabsTrigger
                                value="syllabus"
                                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
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
                                                {course.category.toLowerCase()}{" "}
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
                                                {course.category.toLowerCase()}{" "}
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
                                            {course.category.toLowerCase()}{" "}
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
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle>
                                                Course Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Department
                                                    </span>
                                                    <span className="font-medium">
                                                        {course.category.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Course Code
                                                    </span>
                                                    <span className="font-medium">
                                                        {course.id}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Credits
                                                    </span>
                                                    <span className="font-medium">
                                                        {course.credits}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Semesters Offered
                                                    </span>
                                                    <span className="font-medium">
                                                        {course.semester}{" "}
                                                        {course.year}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Last Updated
                                                    </span>
                                                    <span className="font-medium">
                                                        2 weeks ago
                                                    </span>
                                                </div>
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
                                        href={`/courses/${course.id}/new-review`}
                                    >
                                        <Button>Write a Review</Button>
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {course.reviews.length > 0 ? (
                                        course.reviews.map((review) => (
                                            <Card key={review.id}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar>
                                                                <AvatarImage
                                                                    src={
                                                                        review.avatarUrl ||
                                                                        undefined
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {
                                                                        review
                                                                            .author[0]
                                                                    }
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <CardTitle className="text-base">
                                                                    {
                                                                        review.author
                                                                    }
                                                                </CardTitle>
                                                                <CardDescription>
                                                                    {new Date(
                                                                        review.createdAt
                                                                    ).toLocaleDateString()}
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {renderStars(
                                                                review.rating
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pb-3">
                                                    <p className="text-muted-foreground">
                                                        {review.content}
                                                    </p>
                                                </CardContent>
                                                <CardFooter className="pt-1">
                                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <span>
                                                                Difficulty:
                                                            </span>
                                                            <span className="font-medium">
                                                                {review.difficulty.toFixed(
                                                                    1
                                                                )}
                                                                /5
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span>
                                                                Workload:
                                                            </span>
                                                            <span className="font-medium">
                                                                {review.workload.toFixed(
                                                                    1
                                                                )}
                                                                /5
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-muted-foreground">
                                                No reviews yet. Be the first to
                                                review this course!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="syllabus" className="pt-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        Course Syllabus
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {course.syllabus}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold tracking-tight">
                                        Weekly Schedule
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">
                                                Week 1: Introduction to{" "}
                                                {course.title}
                                            </h4>
                                            <ul className="list-disc pl-6 text-muted-foreground">
                                                <li>
                                                    Overview of key concepts and
                                                    applications
                                                </li>
                                                <li>
                                                    Course structure and
                                                    expectations
                                                </li>
                                                <li>
                                                    Introduction to fundamental
                                                    principles
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">
                                                Week 2-3: Core Concepts
                                            </h4>
                                            <ul className="list-disc pl-6 text-muted-foreground">
                                                <li>
                                                    Detailed exploration of
                                                    foundational theories
                                                </li>
                                                <li>
                                                    Practical applications and
                                                    examples
                                                </li>
                                                <li>
                                                    Hands-on exercises and
                                                    assignments
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">
                                                Week 4-5: Advanced Topics
                                            </h4>
                                            <ul className="list-disc pl-6 text-muted-foreground">
                                                <li>
                                                    Exploration of more complex
                                                    concepts
                                                </li>
                                                <li>
                                                    Case studies and real-world
                                                    applications
                                                </li>
                                                <li>
                                                    Group projects and
                                                    presentations
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">
                                                Week 6: Midterm
                                            </h4>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">
                                                Week 7-10: Specialized Topics
                                            </h4>
                                            <ul className="list-disc pl-6 text-muted-foreground">
                                                <li>
                                                    In-depth exploration of
                                                    specialized areas
                                                </li>
                                                <li>
                                                    Guest lectures from industry
                                                    experts
                                                </li>
                                                <li>
                                                    Advanced projects and
                                                    assignments
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">
                                                Week 11-14: Final Projects
                                            </h4>
                                            <ul className="list-disc pl-6 text-muted-foreground">
                                                <li>
                                                    Project development and
                                                    implementation
                                                </li>
                                                <li>
                                                    Peer reviews and feedback
                                                </li>
                                                <li>
                                                    Final presentations and
                                                    demonstrations
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold tracking-tight">
                                        Grading
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>
                                                Homework Assignments (5)
                                            </span>
                                            <span>30%</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span>Midterm Exam</span>
                                            <span>25%</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span>Final Project</span>
                                            <span>35%</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span>Participation</span>
                                            <span>10%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>
            </div>
        </div>
    );
}
