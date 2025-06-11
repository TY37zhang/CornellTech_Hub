"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface Review {
    id: string;
    content: string;
    overall_rating: number;
    difficulty: number;
    workload: number;
    value: number;
    courseName: string;
    courseCode: string;
    grade?: string | null;
}

export default function EditReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Review | null>(null);
    const { id: reviewId } = use(params);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await fetch(`/api/user/reviews/${reviewId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch review");
                }
                const data = await response.json();
                setFormData(data);
            } catch (error) {
                console.error("Error fetching review:", error);
                toast.error("Failed to load review");
                router.push("/my-reviews");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReview();
    }, [reviewId, router]);

    const validateForm = () => {
        if (!formData) return false;

        const newErrors: Record<string, string> = {};

        if (formData.content.length < 10) {
            newErrors.content = "Review must be at least 10 characters";
        }

        const validGrades = [
            "A+",
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D+",
            "D",
            "D-",
            "F",
            "S",
            "U",
            "HH",
            "H",
            "Dropped",
            "", // allow blank (optional)
            "none", // allow 'Not wish to share' option
        ];
        if (formData.grade && !validGrades.includes(formData.grade)) {
            newErrors.grade = "Invalid grade selected";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData || !validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/user/reviews/${reviewId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    difficulty: formData.difficulty,
                    workload: formData.workload,
                    overall_rating: formData.overall_rating,
                    value: formData.value,
                    content: formData.content,
                    grade: formData.grade === "none" ? null : formData.grade,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update review");
            }

            toast.success("Review updated successfully!");
            router.push("/my-reviews");
        } catch (error) {
            console.error("Error updating review:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update review"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container max-w-2xl py-10">
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (!formData) {
        return null;
    }

    return (
        <div className="container max-w-2xl py-10">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
                disabled={isSubmitting}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Reviews
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Course Review</CardTitle>
                    <CardDescription>
                        Update your review for{" "}
                        <span className="font-bold text-black">
                            {formData.courseName}
                        </span>
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Overall Rating (1-5)</Label>
                                <Slider
                                    value={[formData.overall_rating]}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            overall_rating: value[0],
                                        })
                                    }
                                    min={1}
                                    max={5}
                                    step={1}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Current value: {formData.overall_rating}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Difficulty (1-5)</Label>
                                <Slider
                                    value={[formData.difficulty]}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            difficulty: value[0],
                                        })
                                    }
                                    min={1}
                                    max={5}
                                    step={1}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Current value: {formData.difficulty}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Workload (1-5)</Label>
                                <Slider
                                    value={[formData.workload]}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            workload: value[0],
                                        })
                                    }
                                    min={1}
                                    max={5}
                                    step={1}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Current value: {formData.workload}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Value (1-5)</Label>
                                <Slider
                                    value={[formData.value]}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            value: value[0],
                                        })
                                    }
                                    min={1}
                                    max={5}
                                    step={1}
                                />
                                <div className="text-sm text-muted-foreground">
                                    Current value: {formData.value}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">Grade</Label>
                                <select
                                    id="grade"
                                    value={formData.grade ?? "none"}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            grade: e.target.value,
                                        })
                                    }
                                    className={`w-full border rounded px-3 py-2 ${errors.grade ? "border-red-500" : ""}`}
                                >
                                    <option value="none">
                                        Not wish to share
                                    </option>
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="B-">B-</option>
                                    <option value="C+">C+</option>
                                    <option value="C">C</option>
                                    <option value="C-">C-</option>
                                    <option value="D+">D+</option>
                                    <option value="D">D</option>
                                    <option value="D-">D-</option>
                                    <option value="F">F</option>
                                    <option value="S">S (Satisfactory)</option>
                                    <option value="U">
                                        U (Unsatisfactory)
                                    </option>
                                    <option value="HH">HH (High Honors)</option>
                                    <option value="H">H (Honors)</option>
                                    <option value="Dropped">Dropped</option>
                                </select>
                                {errors.grade && (
                                    <p className="text-sm text-red-500">
                                        {errors.grade}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Review</Label>
                            <Textarea
                                id="content"
                                placeholder="Share your experience with this course..."
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        content: e.target.value,
                                    })
                                }
                                required
                                className={`min-h-[150px] ${
                                    errors.content ? "border-red-500" : ""
                                }`}
                            />
                            {errors.content && (
                                <p className="text-sm text-red-500">
                                    {errors.content}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Update Review"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
