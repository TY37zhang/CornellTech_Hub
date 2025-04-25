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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Review {
    id: string;
    content: string;
    rating: number; // This is actually overall_rating from the backend
    createdAt: string;
    courseId: string;
    courseName: string;
    courseCode: string;
}

export default function MyReviewsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleDelete = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/user/reviews/${reviewId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete review");
            }

            // Remove the deleted review from the state
            setReviews(reviews.filter((review) => review.id !== reviewId));
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
            {reviews.length === 0 ? (
                <div className="text-center text-gray-500">
                    You haven't written any reviews yet.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reviews.map((review) => (
                        <Card
                            key={review.id}
                            className="hover:shadow-lg transition-shadow relative"
                        >
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span className="text-lg">
                                        {review.courseCode}
                                    </span>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                    i <
                                                    Math.round(review.rating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-2">
                                    {review.courseName}
                                </p>
                                <p className="text-sm whitespace-pre-wrap break-words">
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
                                    onClick={() => handleEdit(review.id)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(review.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
