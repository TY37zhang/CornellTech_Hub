"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Star,
    ThumbsDown,
    ThumbsUp,
    Edit,
    Trash2,
    Flag,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { isStudent } from "@/lib/roles";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import ReviewReplies from "@/components/ReviewReplies";

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
    authorId: string | null;
    avatarUrl: string | null;
    grade?: string;
    professor?: string;
    term?: string;
}

interface Professor {
    name: string;
    reviewCount: number;
    rating: number | null;
    difficulty: number | null;
    workload: number | null;
    value: number | null;
    terms: string[];
}

interface Course {
    id: string;
    code?: string;
    codes?: string[];
    title: string;
    professor: string;
    professors?: Professor[];
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
    terms?: string[];
    updatedAt: string;
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
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // Role checking for review creation
    const userRole = session?.user?.role;
    const canCreateReviews = !userRole || isStudent(userRole);
    
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New filtering states
    const [selectedProfessor, setSelectedProfessor] = useState<string>("all");
    const [selectedTerm, setSelectedTerm] = useState<string>("all");
    const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportingReview, setReportingReview] = useState<{id: string, title: string} | null>(null);

    // Move the useMemo hook before any conditional returns to avoid hook ordering issues
    const departmentBadges = React.useMemo(() => {
        if (!course?.departments) return [];

        // More robust deduplication that handles various data types
        const rawDepts = course.departments || [];
        const cleanDepts = rawDepts
            .filter(
                (dept) => dept && typeof dept === "string" && dept.trim() !== ""
            )
            .map((dept) => dept.trim().toUpperCase())
            .filter((dept, index, arr) => arr.indexOf(dept) === index); // Remove duplicates

        return cleanDepts.map((dept) => (
            <Badge
                key={`dept-${dept}-${Date.now()}`}
                variant={dept.toLowerCase() as any}
                className="min-w-[56px] justify-center text-center"
            >
                {dept}
            </Badge>
        ));
    }, [course?.departments]);

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
            // Filter reviews based on selected professor and term
            let filtered = course.reviews;

            if (selectedProfessor !== "all") {
                filtered = filtered.filter(
                    (review) => review.professor === selectedProfessor
                );
            }

            if (selectedTerm !== "all") {
                filtered = filtered.filter(
                    (review) => review.term === selectedTerm
                );
            }

            setFilteredReviews(filtered);

            // Update course metrics based on filtered reviews
            if (filtered.length > 0) {
                const averages = calculateAverages(filtered);
                setCourse((prev) => ({
                    ...prev!,
                    rating: averages.rating,
                    difficulty: averages.difficulty,
                    workload: averages.workload,
                    value: averages.value,
                    reviewCount: filtered.length,
                }));
            } else {
                // Reset to original values if no reviews match filter
                const originalAverages = calculateAverages(course.reviews);
                setCourse((prev) => ({
                    ...prev!,
                    rating: originalAverages.rating,
                    difficulty: originalAverages.difficulty,
                    workload: originalAverages.workload,
                    value: originalAverages.value,
                    reviewCount: course.reviews.length,
                }));
            }
        }
    }, [course?.reviews, selectedProfessor, selectedTerm]);

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

    const handleWriteReview = () => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push(`/auth/signin?callbackUrl=/courses/${params.slug}`);
            return;
        }

        if (!course) return;

        const reviewUrl = `/courses/new-review?courseId=${course.id}&courseName=${encodeURIComponent(course.title)}&courseCode=${encodeURIComponent(course.id)}&professor=${encodeURIComponent(course.professor)}&category=${(course.departments?.[0] || "").toLowerCase()}`;
        router.push(reviewUrl);
    };

    const handleEditReview = (reviewId: string) => {
        router.push(`/reviews/${reviewId}/edit`);
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/user/reviews/${reviewId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete review");
            }

            // Remove the deleted review from local state
            if (course) {
                const updatedReviews = course.reviews.filter((review) => review.id !== reviewId);
                setCourse({
                    ...course,
                    reviews: updatedReviews,
                    reviewCount: updatedReviews.length,
                });
            }

            toast.success("Review deleted successfully");
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review. Please try again.");
        } finally {
            setReviewToDelete(null);
        }
    };

    const handleReportReview = (review: Review) => {
        setReportingReview({
            id: review.id,
            title: `Review by ${review.author} for ${course?.title || 'course'}`
        });
        setReportModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="w-full px-4 py-8 md:px-6 lg:px-8">
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
            <div className="w-full px-4 py-8 md:px-6 lg:px-8">
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
                <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-pink-50 to-white">
                    <div className="w-full px-4 md:px-6 lg:px-8">
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
                                            {departmentBadges}
                                        </div>
                                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                            {course.title}
                                        </h1>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                                            {/* Desktop: Show stars, rating, and review count */}
                                            <div className="hidden sm:flex items-center">
                                                {renderStars(course.rating)}
                                                <span className="ml-2">
                                                    {course.rating
                                                        ? course.rating.toFixed(
                                                              1
                                                          )
                                                        : "0.0"}
                                                </span>
                                                <span className="ml-1">
                                                    ({course.reviewCount || 0}{" "}
                                                    review
                                                    {course.reviewCount !== 1
                                                        ? "s"
                                                        : ""}
                                                    )
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                <span>
                                                    {course.codes &&
                                                    course.codes.length > 1
                                                        ? course.codes.join(", ")
                                                        : course.code ||
                                                          course.id}{" "}
                                                    • {course.credits || 0} Credit
                                                    {course.credits !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                                {/* Mobile: Show review count after credits */}
                                                <span className="sm:hidden ml-2">
                                                    • ({course.reviewCount || 0}{" "}
                                                    review
                                                    {course.reviewCount !== 1
                                                        ? "s"
                                                        : ""}
                                                    )
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Card>
                                    <CardHeader className="pb-3 flex items-center justify-center">
                                        <CardTitle className="text-center w-full">
                                            Course Rating Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-6">
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
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="min-w-[80px] text-sm text-muted-foreground">
                                                        Difficulty
                                                    </span>
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <div className="h-2.5 flex-1 rounded-full bg-muted">
                                                            <div
                                                                className="h-2.5 rounded-full bg-yellow-400 transition-all"
                                                                style={{
                                                                    width: `${(course.difficulty / 5) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="min-w-[40px] text-sm font-medium">
                                                            {course.difficulty.toFixed(
                                                                1
                                                            )}
                                                            /5
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="min-w-[80px] text-sm text-muted-foreground">
                                                        Workload
                                                    </span>
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <div className="h-2.5 flex-1 rounded-full bg-muted">
                                                            <div
                                                                className="h-2.5 rounded-full bg-yellow-400 transition-all"
                                                                style={{
                                                                    width: `${(course.workload / 5) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="min-w-[40px] text-sm font-medium">
                                                            {course.workload.toFixed(
                                                                1
                                                            )}
                                                            /5
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="min-w-[80px] text-sm text-muted-foreground">
                                                        Value
                                                    </span>
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <div className="h-2.5 flex-1 rounded-full bg-muted">
                                                            <div
                                                                className="h-2.5 rounded-full bg-yellow-400 transition-all"
                                                                style={{
                                                                    width: `${(course.value / 5) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="min-w-[40px] text-sm font-medium">
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
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="w-full px-4 py-2 md:px-6 lg:px-8">
                    <Tabs defaultValue="reviews" className="w-full">
                        <TabsList className="flex h-10 items-center gap-6 justify-center rounded-none border-b bg-transparent p-0 w-full">
                            <TabsTrigger
                                value="reviews"
                                className="relative px-4 pb-2 text-base data-[state=active]:text-gray-900 data-[state=active]:font-semibold text-gray-500 hover:text-gray-700 !rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:mb-[-1px] data-[state=active]:z-10 [&>*]:!rounded-none before:!rounded-none after:!rounded-none"
                            >
                                Reviews
                            </TabsTrigger>
                            <TabsTrigger
                                value="overview"
                                className="relative px-4 pb-2 text-base data-[state=active]:text-gray-900 data-[state=active]:font-semibold text-gray-500 hover:text-gray-700 !rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:mb-[-1px] data-[state=active]:z-10 [&>*]:!rounded-none before:!rounded-none after:!rounded-none"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="syllabus"
                                className="relative px-4 pb-2 text-base data-[state=active]:text-gray-900 data-[state=active]:font-semibold text-gray-500 hover:text-gray-700 !rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:mb-[-1px] data-[state=active]:z-10 [&>*]:!rounded-none before:!rounded-none after:!rounded-none"
                            >
                                Syllabus
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="pt-6">
                            <div className="flex items-center justify-center py-12">
                                <p className="text-center text-muted-foreground text-lg">
                                    Coming soon, currently in dev XD
                                </p>
                            </div>
                        </TabsContent>
                        <TabsContent value="reviews" className="pt-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        Course Reviews
                                    </h2>
                                    {canCreateReviews && (
                                        <>
                                            {/* Desktop: Full button with text */}
                                            <Button 
                                                onClick={handleWriteReview}
                                                className="!hidden md:!flex bg-black text-white hover:bg-gray-800"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Write a Review
                                            </Button>
                                            {/* Mobile: Square icon-only button */}
                                            <Button 
                                                onClick={handleWriteReview}
                                                size="icon"
                                                className="md:!hidden bg-black text-white hover:bg-gray-800 !h-8 !w-8"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                
                                {/* Professor Filter - moved below on its own line */}
                                {course.professors &&
                                    course.professors.length > 1 && (
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={selectedProfessor}
                                                onValueChange={setSelectedProfessor}
                                            >
                                                <SelectTrigger className="w-48">
                                                    <SelectValue placeholder="All Professors" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Professors ({course.reviewCount} reviews)
                                                    </SelectItem>
                                                    {course.professors
                                                        .filter(
                                                            (prof) =>
                                                                prof.name !== "Unknown Professor"
                                                        )
                                                        .map((prof) => (
                                                            <SelectItem
                                                                key={prof.name}
                                                                value={prof.name}
                                                            >
                                                                {prof.name} ({prof.reviewCount} reviews)
                                                                {prof.rating && (
                                                                    <span className="ml-2 text-yellow-600">
                                                                        ⭐ {prof.rating.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>

                                            {selectedProfessor !== "all" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedProfessor("all");
                                                    }}
                                                    className="whitespace-nowrap"
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                {filteredReviews.length > 0 ||
                                course.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {(filteredReviews.length > 0
                                            ? filteredReviews
                                            : course.reviews
                                        ).map((review) => (
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
                                                                    loading="lazy"
                                                                />
                                                                <AvatarFallback>
                                                                    {review.author.charAt(
                                                                        0
                                                                    ) +
                                                                        "******"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-medium leading-none">
                                                                    {review.author.charAt(
                                                                        0
                                                                    ) +
                                                                        "******"}
                                                                </p>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {new Date(
                                                                            review.createdAt
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                    {review.professor && (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Prof. {review.professor}
                                                                        </p>
                                                                    )}
                                                                    {review.term && (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {review.term}
                                                                        </p>
                                                                    )}
                                                                </div>
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
                                                </CardContent>
                                                <CardFooter className="flex items-center justify-between pt-2">
                                                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm md:flex md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:gap-y-1">
                                                        <div>
                                                            <span className="font-semibold">
                                                                Difficulty:
                                                            </span>
                                                            <span className="ml-1 font-normal">
                                                                {review.difficulty}/5
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold">
                                                                Value:
                                                            </span>
                                                            <span className="ml-1 font-normal">
                                                                {review.value}/5
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold">
                                                                Workload:
                                                            </span>
                                                            <span className="ml-1 font-normal">
                                                                {review.workload}/5
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold">
                                                                Grade:
                                                            </span>
                                                            <span className="ml-1 font-normal">
                                                                {review.grade !== undefined && review.grade !== null
                                                                    ? review.grade
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {session?.user?.id === review.authorId ? (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditReview(review.id)}
                                                                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setReviewToDelete(review.id)}
                                                                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleReportReview(review)}
                                                                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                                                                >
                                                                    <Flag className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleReportReview(review)}
                                                                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                                                            >
                                                                <Flag className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardFooter>
                                                
                                                {/* Faculty Replies */}
                                                <div className="px-6 pb-6">
                                                    <ReviewReplies reviewId={review.id} />
                                                </div>
                                            </Card>
                                        ))}

                                        {filteredReviews.length === 0 &&
                                            selectedProfessor !== "all" && (
                                                <div className="flex flex-col items-center justify-center space-y-4 py-8 border-2 border-dashed rounded-lg">
                                                    <p className="text-center text-muted-foreground">
                                                        No reviews found for the
                                                        selected filters.
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedProfessor(
                                                                "all"
                                                            );
                                                            setSelectedTerm(
                                                                "all"
                                                            );
                                                        }}
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                </div>
                                            )}
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
                        <TabsContent value="syllabus" className="pt-6">
                            <div className="flex items-center justify-center py-12">
                                <p className="text-center text-muted-foreground text-lg">
                                    Coming soon, currently in dev XD
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>
            </div>

            {/* Delete Review Confirmation Dialog */}
            <AlertDialog open={!!reviewToDelete} onOpenChange={() => setReviewToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => reviewToDelete && handleDeleteReview(reviewToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Report Review Modal */}
            {reportingReview && (
                <ReportModal
                    isOpen={reportModalOpen}
                    onClose={() => {
                        setReportModalOpen(false);
                        setReportingReview(null);
                    }}
                    reportedItemType="review"
                    reportedItemId={reportingReview.id}
                    reportedItemTitle={reportingReview.title}
                />
            )}
        </div>
    );
}
