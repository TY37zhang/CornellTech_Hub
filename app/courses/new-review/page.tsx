"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function NewReviewPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: "",
        professor: "",
        category: "",
        difficulty: 3,
        workload: 3,
        value: 3,
        overall_rating: 3,
        review: "",
        courseId: "",
    });

    useEffect(() => {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const courseId = params.get("courseId");
        const courseName = params.get("courseName");
        const courseCode = params.get("courseCode");
        const professor = params.get("professor");
        const category = params.get("category");

        if (courseId && courseName) {
            setFormData((prev) => ({
                ...prev,
                title: courseName,
                courseId: courseId,
                professor: professor || "",
                category: category || "",
            }));
        }
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.title.length < 2) {
            newErrors.title = "Title must be at least 2 characters";
        }

        if (formData.professor.length < 2) {
            newErrors.professor =
                "Professor name must be at least 2 characters";
        }

        if (!formData.category) {
            newErrors.category = "Please select a category";
        }

        if (formData.review.length < 10) {
            newErrors.review = "Review must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/courses/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    course_id: formData.courseId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit review");
            }

            toast.success("Review submitted successfully!");
            router.push(`/courses/${formData.courseId}`);
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to submit review"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-2xl py-10">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
                disabled={isSubmitting}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Add a New Course Review</CardTitle>
                    <CardDescription>
                        Share your experience with a Cornell Tech course to help
                        other students make informed decisions.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Machine Learning"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                required
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="professor">Professor</Label>
                            <Input
                                id="professor"
                                placeholder="e.g., Prof. John Doe"
                                value={formData.professor}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        professor: e.target.value,
                                    })
                                }
                                required
                                className={
                                    errors.professor ? "border-red-500" : ""
                                }
                            />
                            {errors.professor && (
                                <p className="text-sm text-red-500">
                                    {errors.professor}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Subject</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
                                }
                            >
                                <SelectTrigger
                                    className={
                                        errors.category ? "border-red-500" : ""
                                    }
                                >
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ceee">CEEE</SelectItem>
                                    <SelectItem value="cs">CS</SelectItem>
                                    <SelectItem value="ece">ECE</SelectItem>
                                    <SelectItem value="hadm">HADM</SelectItem>
                                    <SelectItem value="info">INFO</SelectItem>
                                    <SelectItem value="law">LAW</SelectItem>
                                    <SelectItem value="orie">ORIE</SelectItem>
                                    <SelectItem value="tech">TECH</SelectItem>
                                    <SelectItem value="techie">
                                        TECHIE
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-sm text-red-500">
                                    {errors.category}
                                </p>
                            )}
                        </div>

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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review">Review</Label>
                            <Textarea
                                id="review"
                                placeholder="Share your experience with this course..."
                                value={formData.review}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        review: e.target.value,
                                    })
                                }
                                required
                                className={`min-h-[150px] ${
                                    errors.review ? "border-red-500" : ""
                                }`}
                            />
                            {errors.review && (
                                <p className="text-sm text-red-500">
                                    {errors.review}
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
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
