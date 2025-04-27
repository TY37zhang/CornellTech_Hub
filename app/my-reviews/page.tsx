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

interface Review {
    id: string;
    content: string;
    rating: number;
    difficulty?: number;
    workload?: number;
    value?: number;
    createdAt: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    category: string;
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
    };
    return (
        colors[category.toLowerCase()] ||
        "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/20 dark:text-gray-400"
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
                console.log("Reviews data:", data); // Debug log
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
            result = result.filter((review) => review.category === activeTab);
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
                <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
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

                <section className="container px-4 py-6 md:px-6">
                    <Tabs
                        defaultValue="all"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList>
                            <TabsTrigger value="all">All Courses</TabsTrigger>
                            <TabsTrigger value="ceee">CEEE</TabsTrigger>
                            <TabsTrigger value="cs">CS</TabsTrigger>
                            <TabsTrigger value="ece">ECE</TabsTrigger>
                            <TabsTrigger value="hadm">HADM</TabsTrigger>
                            <TabsTrigger value="info">INFO</TabsTrigger>
                            <TabsTrigger value="law">LAW</TabsTrigger>
                            <TabsTrigger value="orie">ORIE</TabsTrigger>
                            <TabsTrigger value="tech">TECH</TabsTrigger>
                            <TabsTrigger value="techie">TECHIE</TabsTrigger>
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
                                                    <div>
                                                        <CardTitle className="text-xl">
                                                            {review.courseCode}
                                                        </CardTitle>
                                                        <CardDescription className="text-sm">
                                                            {review.courseName}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge
                                                        className={getCategoryColor(
                                                            review.category
                                                        )}
                                                    >
                                                        {review.category?.toUpperCase()}
                                                    </Badge>
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
                                                        {review.rating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                    {review.difficulty !==
                                                        undefined && (
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
                                                                                review.difficulty *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {review.difficulty.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {review.workload !==
                                                        undefined && (
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
                                                                                review.workload *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {review.workload.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {review.value !==
                                                        undefined && (
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
                                                                                review.value *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {review.value.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-4 text-sm whitespace-pre-wrap break-words text-muted-foreground">
                                                    {review.content}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(
                                                        review.createdAt
                                                    ).toLocaleDateString()}
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
                                                        handleDelete(review.id)
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
        </div>
    );
}
