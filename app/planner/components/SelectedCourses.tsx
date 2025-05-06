"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    description?: string;
    department: string;
    semester: string;
    year: number;
    taken?: boolean;
}

interface Requirement {
    credits: number;
    description: string;
}

interface SelectedCoursesProps {
    selectedCourses: Course[];
    onRemoveCourse: (course: Course) => void;
    requirements: { [key: string]: Requirement };
    onAddToRequirement: (course: Course, requirementKey: string | null) => void;
    coursePlan: { [key: string]: Course[] };
    onCourseTaken: (course: Course, taken: boolean) => void;
}

export default function SelectedCourses({
    selectedCourses,
    onRemoveCourse,
    requirements,
    onAddToRequirement,
    coursePlan,
    onCourseTaken,
}: SelectedCoursesProps) {
    // Find which requirement a course is currently assigned to
    const findCourseAssignment = (courseId: string): string | null => {
        for (const [reqKey, courses] of Object.entries(coursePlan)) {
            if (courses.some((c) => c.id === courseId)) {
                return reqKey;
            }
        }
        return null;
    };

    return (
        <Card className="p-6 w-full overflow-hidden">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Selected Courses</h3>
                <div className="grid gap-2">
                    {selectedCourses.map((course) => {
                        const currentAssignment = findCourseAssignment(
                            course.id
                        );
                        return (
                            <div
                                key={course.id}
                                className="flex flex-col space-y-2 p-4 border rounded-lg"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <h4 className="font-medium truncate">
                                            {course.code}
                                        </h4>
                                        <p className="text-sm text-gray-600 truncate">
                                            {course.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span>{course.department}</span>
                                            <span>•</span>
                                            <span>
                                                {course.semester} {course.year}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {course.credits} credits
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`taken-${course.id}`}
                                                checked={course.taken}
                                                onCheckedChange={(checked) =>
                                                    onCourseTaken(
                                                        course,
                                                        checked as boolean
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`taken-${course.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {course.taken
                                                    ? "Taken"
                                                    : "Taken?"}
                                            </label>
                                        </div>
                                        <Select
                                            value={currentAssignment || "none"}
                                            onValueChange={(value) => {
                                                onAddToRequirement(
                                                    course,
                                                    value === "none"
                                                        ? null
                                                        : value
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-[200px] h-9">
                                                <div className="flex-1 text-left truncate pr-2">
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value="none"
                                                    className="text-sm"
                                                >
                                                    No Selection
                                                </SelectItem>
                                                {Object.entries(
                                                    requirements
                                                ).map(([key, requirement]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                        className="text-sm"
                                                    >
                                                        {key
                                                            .replace(
                                                                /([A-Z])/g,
                                                                " $1"
                                                            )
                                                            .trim()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onRemoveCourse(course)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {selectedCourses.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                            No courses selected
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
