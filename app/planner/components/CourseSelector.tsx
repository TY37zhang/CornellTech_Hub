"use client";

import React, { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Loader2 } from "lucide-react";

interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    description?: string;
    department: string;
    semester: string;
    year: number;
}

interface CourseSelectorProps {
    requirement: {
        credits: number;
        description: string;
    };
    selectedCourses: Course[];
    onSelectCourse: (course: Course) => void;
    searchQuery: string;
}

export default function CourseSelector({
    requirement,
    selectedCourses,
    onSelectCourse,
    searchQuery,
}: CourseSelectorProps) {
    const [searchResults, setSearchResults] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchQuery, 300);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setSearchResults([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!debouncedSearch) {
                setSearchResults([]);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

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
                setSearchResults(
                    data.filter(
                        (course: Course) =>
                            !selectedCourses.some(
                                (selected) => selected.id === course.id
                            )
                    )
                );
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch courses"
                );
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [debouncedSearch, selectedCourses]);

    if (!searchQuery) return null;

    return (
        <div ref={containerRef} className="space-y-2">
            {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Searching courses...</span>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
            ) : searchResults.length > 0 ? (
                <div className="grid gap-2">
                    {searchResults.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => {
                                onSelectCourse(course);
                                setSearchResults([]);
                            }}
                            className="flex items-center p-3 border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                    {course.code}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                    {course.name}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {course.department}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {course.semester} {course.year}
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {course.credits} credits
                                    </Badge>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to add
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
