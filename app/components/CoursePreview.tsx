"use client";

import { useMemo, memo } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
    id: string;
    title: string;
    rating: number;
}

interface CoursePreviewProps {
    topCourses: Course[];
    topCourseError: string | null;
}

// Memoized star rating component for performance
const StarRating = memo(({ rating }: { rating: number }) => {
    const stars = useMemo(() => {
        return [1, 2, 3, 4, 5].map((i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i <= Math.round(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                }`}
            />
        ));
    }, [rating]);

    return <div className="flex items-center">{stars}</div>;
});

StarRating.displayName = 'StarRating';

function CoursePreview({ topCourses, topCourseError }: CoursePreviewProps) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <div className="h-5 w-5 text-red-600">📚</div>
                    Course Reviews
                </CardTitle>
                <CardDescription>
                    Find and share reviews for Cornell Tech courses
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-2">
                    {topCourseError ? (
                        <div className="text-red-500 text-sm">{topCourseError}</div>
                    ) : (
                        topCourses.map((course) => (
                            <div
                                className="flex items-center justify-between"
                                key={course.id}
                            >
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="font-medium hover:underline max-w-[70%] truncate"
                                    style={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "block",
                                    }}
                                >
                                    {course.title}
                                </Link>
                                <StarRating rating={course.rating} />
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/courses">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
                    >
                        View All Courses
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

export default memo(CoursePreview);