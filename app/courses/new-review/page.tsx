"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface Course {
    id: string;
    code: string;
    codes: string[];
    name: string;
    credits: number;
    description?: string;
    department: string;
    departments: string[];
    semester: string;
    year: number;
    professor_id?: string;
    isCrossListed: boolean;
}

export default function NewReviewPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Course[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchQuery, 300);

    const [formData, setFormData] = useState({
        title: "",
        professor: "",
        category: "",
        categories: [] as string[],
        difficulty: 3,
        workload: 3,
        value: 3,
        overall_rating: 3,
        review: "",
        courseId: "",
        courseCode: "",
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
                categories: category ? category.split(", ") : [],
            }));
        }
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!debouncedSearch) {
                setSearchResults([]);
                setSearchError(null);
                return;
            }

            setIsSearching(true);
            setSearchError(null);

            try {
                const response = await fetch(
                    `/api/courses/search?q=${encodeURIComponent(debouncedSearch)}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                setSearchResults(data);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setSearchError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch courses"
                );
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchCourses();
    }, [debouncedSearch]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.title.length < 2) {
            newErrors.title = "Title must be at least 2 characters";
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
                    category: formData.categories.join(", "),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit review");
            }

            toast.success("Review submitted successfully!");
            router.back();
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

    const handleSelectCourse = (course: Course) => {
        setFormData((prev) => ({
            ...prev,
            title: course.name,
            courseId: course.id,
            professor: course.professor_id || "",
            category: course.departments[0] || "",
            categories: course.departments,
            courseCode: course.codes[0],
        }));
        setSearchQuery("");
        setSearchResults([]);
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
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="title"
                                    placeholder="Search for a course..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-8 rounded-xl"
                                    autoComplete="off"
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-auto bg-background border rounded-lg shadow-lg z-50">
                                        {searchResults.map((course) => (
                                            <div
                                                key={course.id}
                                                onClick={() =>
                                                    handleSelectCourse(course)
                                                }
                                                className="flex items-center p-3 hover:bg-accent/5 transition-colors cursor-pointer"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">
                                                        {course.codes.join(
                                                            " / "
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {course.name}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {course.departments.map(
                                                            (dept, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {dept}
                                                                </Badge>
                                                            )
                                                        )}
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {course.semester}{" "}
                                                            {course.year}
                                                        </Badge>
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {course.credits}{" "}
                                                            credits
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {formData.title && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            Selected Course:
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {formData.title}
                                        </span>
                                    </div>
                                    {formData.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.categories.map(
                                                (dept, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant={
                                                            dept.toLowerCase() as any
                                                        }
                                                        className="min-w-[56px] justify-center text-center"
                                                    >
                                                        {dept.toUpperCase()}
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.title && (
                                <p className="text-sm text-red-500">
                                    {errors.title}
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
