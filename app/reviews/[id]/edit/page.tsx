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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Review {
    id: string;
    content: string;
    overall_rating: number;
    difficulty: number;
    workload: number;
    value: number;
    courseName: string;
    courseCode: string;
    professor: string;
    grade?: string | null;
}

interface Professor {
    id: string;
    name: string;
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

    // Professor selection state
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [isLoadingProfessors, setIsLoadingProfessors] = useState(false);
    const [isManualProfessorEntry, setIsManualProfessorEntry] = useState(false);
    const [manualProfessorName, setManualProfessorName] = useState("");

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await fetch(`/api/user/reviews/${reviewId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch review");
                }
                const data = await response.json();
                setFormData(data);

                // Fetch professors for this course
                if (data.courseName) {
                    fetchProfessorsForCourse(data.courseName);
                }
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

    const fetchProfessorsForCourse = async (courseName: string) => {
        if (!courseName) return;

        setIsLoadingProfessors(true);
        try {
            const response = await fetch(
                `/api/courses/${encodeURIComponent(courseName)}/professors`
            );
            if (response.ok) {
                const professors = await response.json();
                setProfessors(professors);
            } else {
                console.error("Failed to fetch professors");
                setProfessors([]);
            }
        } catch (error) {
            console.error("Error fetching professors:", error);
            setProfessors([]);
        } finally {
            setIsLoadingProfessors(false);
        }
    };

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
                    professor: isManualProfessorEntry ? manualProfessorName : formData.professor,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update review");
            }

            toast.success("Review updated successfully!");
            router.back();
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
            <div className="min-h-screen bg-background">
                <div className="container max-w-2xl py-10 mx-auto">
                    <div className="flex justify-center items-center min-h-[50vh]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!formData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-2xl py-10 mx-auto">
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
                        {/* Professor Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="professor">Professor</Label>
                            {isLoadingProfessors ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
                                    <span className="text-sm text-muted-foreground">
                                        Loading professors...
                                    </span>
                                </div>
                            ) : professors.length > 0 &&
                              !professors.every(
                                  (prof) => prof.name === "Unknown Professor"
                              ) ? (
                                !isManualProfessorEntry ? (
                                    <div className="space-y-2">
                                        <Select
                                            value={formData.professor}
                                            onValueChange={(value) => {
                                                if (value === "manual_entry") {
                                                    setIsManualProfessorEntry(true);
                                                    setManualProfessorName(formData.professor || "");
                                                    setFormData({
                                                        ...formData,
                                                        professor: "",
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        professor: value,
                                                    });
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                id="professor"
                                                className={
                                                    errors.professor
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            >
                                                <SelectValue placeholder="Select a professor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {professors.map((prof) => (
                                                    <SelectItem
                                                        key={prof.id}
                                                        value={prof.id}
                                                    >
                                                        {prof.name}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="manual_entry">
                                                    ✏️ Add Custom Professor
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Input
                                            id="professor"
                                            placeholder="Enter professor name"
                                            value={manualProfessorName}
                                            onChange={(e) =>
                                                setManualProfessorName(e.target.value)
                                            }
                                            className={
                                                errors.professor
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsManualProfessorEntry(false);
                                                setManualProfessorName("");
                                            }}
                                        >
                                            ← Back to professor list
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        id="professor"
                                        placeholder="Enter professor name (optional)"
                                        value={
                                            formData.professor ===
                                            "Unknown Professor"
                                                ? ""
                                                : formData.professor
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                professor: e.target.value,
                                            })
                                        }
                                        className={
                                            errors.professor
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        No professors found. You can enter the
                                        professor's name manually.
                                    </p>
                                </div>
                            )}
                            {errors.professor && (
                                <p className="text-sm text-red-500">
                                    {errors.professor}
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

                            <div className="space-y-2">
                                <Label htmlFor="grade">Grade</Label>
                                <Select
                                    value={formData.grade ?? "none"}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            grade: value,
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="grade"
                                        className={
                                            errors.grade ? "border-red-500" : ""
                                        }
                                    >
                                        <SelectValue placeholder="Select grade (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Not wish to share
                                        </SelectItem>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="C+">C+</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                        <SelectItem value="C-">C-</SelectItem>
                                        <SelectItem value="D+">D+</SelectItem>
                                        <SelectItem value="D">D</SelectItem>
                                        <SelectItem value="D-">D-</SelectItem>
                                        <SelectItem value="F">F</SelectItem>
                                        <SelectItem value="S">
                                            S (Satisfactory)
                                        </SelectItem>
                                        <SelectItem value="U">
                                            U (Unsatisfactory)
                                        </SelectItem>
                                        <SelectItem value="HH">
                                            HH (High Honors)
                                        </SelectItem>
                                        <SelectItem value="H">
                                            H (Honors)
                                        </SelectItem>
                                        <SelectItem value="Dropped">
                                            Dropped
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
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
                            className="w-full bg-black text-white hover:bg-gray-800"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Update Review"}
                        </Button>
                    </CardFooter>
                </form>
                </Card>
            </div>
        </div>
    );
}
