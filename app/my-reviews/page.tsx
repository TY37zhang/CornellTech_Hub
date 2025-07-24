"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

interface Review {
    id: string;
    content: string;
    rating: number;
    difficulty?: number;
    workload?: number;
    value?: number;
    grade?: string;
    createdAt: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    category: string;
    professor?: string;
    semester?: string;
    year?: string;
    crossListed?: {
        codes: string[];
        departments: string[];
    };
}

// Helper function to get category color
function getCategoryColor(category: string | undefined): string {
    if (!category) {
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
    const colors: { [key: string]: string } = {
        CEEE: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        CS: "bg-red-100 text-red-800 hover:bg-red-100",
        ECE: "bg-green-100 text-green-800 hover:bg-green-100",
        HADM: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        INFO: "bg-purple-100 text-purple-800 hover:bg-purple-100",
        LAW: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
        ORIE: "bg-pink-100 text-pink-800 hover:bg-pink-100",
        TECH: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        TECHIE: "bg-teal-100 text-teal-800 hover:bg-teal-100",
    };
    return (
        colors[category.toUpperCase()] ||
        "bg-gray-100 text-gray-800 hover:bg-gray-100"
    );
}

export default function MyReviewsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        const fetchReviews = async () => {
            try {
                const response = await fetch("/api/user/reviews");
                if (!response.ok) {
                    throw new Error("Failed to fetch reviews");
                }
                const data = await response.json();
                setReviews(data);
                setFilteredReviews(data);
            } catch (err) {
                setError("Failed to load reviews. Please try again later.");
                console.error("Error fetching reviews:", err);
            } finally {
                setLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchReviews();
        }
    }, [status, router]);

    // Apply tab filter
    useEffect(() => {
        let result = [...reviews];

        // Filter by category
        if (activeTab !== "all") {
            result = result.filter((review) => {
                if (review.crossListed) {
                    // For cross-listed courses, check if any department matches the active tab
                    return review.crossListed.departments.some(
                        (dept) => dept.toUpperCase() === activeTab
                    );
                }
                // For non-cross-listed courses, check the single category
                return review.category?.toUpperCase() === activeTab;
            });
        }

        setFilteredReviews(result);
    }, [activeTab, reviews]);

    const handleDelete = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/user/reviews/${reviewId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete review");
            }

            // Remove the deleted review from both states
            const updatedReviews = reviews.filter(
                (review) => review.id !== reviewId
            );
            setReviews(updatedReviews);
            setFilteredReviews(
                filteredReviews.filter((review) => review.id !== reviewId)
            );
            toast.success("Review deleted successfully");
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };

    const handleEdit = (reviewId: string) => {
        router.push(`/reviews/${reviewId}/edit`);
    };

    if (status === "loading" || loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-pink-50 to-white">
                    <div className="w-full px-4 md:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <h1 className="text-4xl font-bold tracking-tight">
                                My Reviews
                            </h1>
                            <p className="text-muted-foreground text-lg mt-2">
                                Your forum discussions and contributions
                            </p>
                        </div>
                    </div>
                </section>

                <section className="w-full px-4 py-6 md:px-6 lg:px-8">
                    <Tabs
                        defaultValue="all"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList>
                            <TabsTrigger value="all">All Courses</TabsTrigger>
                            <TabsTrigger value="CEEE">CEEE</TabsTrigger>
                            <TabsTrigger value="CS">CS</TabsTrigger>
                            <TabsTrigger value="ECE">ECE</TabsTrigger>
                            <TabsTrigger value="HADM">HADM</TabsTrigger>
                            <TabsTrigger value="INFO">INFO</TabsTrigger>
                            <TabsTrigger value="LAW">LAW</TabsTrigger>
                            <TabsTrigger value="ORIE">ORIE</TabsTrigger>
                            <TabsTrigger value="TECH">TECH</TabsTrigger>
                            <TabsTrigger value="TECHIE">TECHIE</TabsTrigger>
                        </TabsList>
                        <TabsContent value={activeTab} className="mt-6">
                            {filteredReviews.length === 0 ? (
                                <div className="text-center text-gray-500">
                                    {reviews.length === 0
                                        ? "You haven't written any reviews yet."
                                        : "No reviews found in this category."}
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredReviews.map((review) => (
                                        <Card
                                            key={review.id}
                                            className="h-full overflow-hidden transition-all hover:border-primary"
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl">
                                                            {review.courseName}
                                                        </CardTitle>
                                                        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                                            <div>
                                                                {new Date(
                                                                    review.createdAt
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        month: "numeric",
                                                                        day: "numeric", 
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </div>
                                                            {review.professor && (
                                                                <div>Prof. {review.professor}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {review.crossListed ? (
                                                            review.crossListed.departments.map(
                                                                (
                                                                    dept,
                                                                    index
                                                                ) => (
                                                                    <Badge
                                                                        key={`${dept}-${index}`}
                                                                        variant={
                                                                            dept.toLowerCase() as any
                                                                        }
                                                                        className="min-w-[56px] justify-center text-center"
                                                                    >
                                                                        {dept.toUpperCase()}
                                                                    </Badge>
                                                                )
                                                            )
                                                        ) : (
                                                            <Badge
                                                                variant={
                                                                    review.category.toLowerCase() as any
                                                                }
                                                                className="min-w-[56px] justify-center text-center"
                                                            >
                                                                {review.category.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <div className="flex">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i <
                                                                        Math.round(
                                                                            review.rating
                                                                        )
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                    <span className="font-medium">
                                                        {review.rating?.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                    {review.difficulty !==
                                                        undefined && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground w-16 flex-shrink-0">
                                                                Difficulty
                                                            </span>
                                                            <div className="flex items-center gap-2 flex-1 justify-end">
                                                                <div className="h-2 w-24 rounded-full bg-muted flex-shrink-0">
                                                                    <div
                                                                        className="h-2 rounded-full bg-yellow-400"
                                                                        style={{
                                                                            width: `${
                                                                                (review.difficulty ||
                                                                                    0) *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="w-8 text-right flex-shrink-0">
                                                                    {review.difficulty?.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {review.workload !==
                                                        undefined && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground w-16 flex-shrink-0">
                                                                Workload
                                                            </span>
                                                            <div className="flex items-center gap-2 flex-1 justify-end">
                                                                <div className="h-2 w-24 rounded-full bg-muted flex-shrink-0">
                                                                    <div
                                                                        className="h-2 rounded-full bg-yellow-400"
                                                                        style={{
                                                                            width: `${
                                                                                (review.workload ||
                                                                                    0) *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="w-8 text-right flex-shrink-0">
                                                                    {review.workload?.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {review.value !==
                                                        undefined && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground w-16 flex-shrink-0">
                                                                Value
                                                            </span>
                                                            <div className="flex items-center gap-2 flex-1 justify-end">
                                                                <div className="h-2 w-24 rounded-full bg-muted flex-shrink-0">
                                                                    <div
                                                                        className="h-2 rounded-full bg-yellow-400"
                                                                        style={{
                                                                            width: `${
                                                                                (review.value ||
                                                                                    0) *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="w-8 text-right flex-shrink-0">
                                                                    {review.value?.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                                                    <span className="mr-2">
                                                        Grade:
                                                    </span>
                                                    <span>
                                                        {review.grade &&
                                                        review.grade.trim() !==
                                                            ""
                                                            ? review.grade
                                                            : "N/A"}
                                                    </span>
                                                </div>
                                                <p className="mt-4 text-sm whitespace-pre-wrap break-words text-muted-foreground">
                                                    {review.content}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(review.id)
                                                    }
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setReviewToDelete(
                                                            review.id
                                                        )
                                                    }
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </section>
            </div>

            <AlertDialog
                open={!!reviewToDelete}
                onOpenChange={() => setReviewToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this review? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                reviewToDelete && handleDelete(reviewToDelete)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
