"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
}

export default function SelectedCourses({
    selectedCourses,
    onRemoveCourse,
    requirements,
    onAddToRequirement,
    coursePlan,
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
        <Card className="p-6">
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
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium">
                                        {course.code}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {course.name}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <Badge
                                            variant={
                                                course.department.toLowerCase() as any
                                            }
                                            className="text-xs"
                                        >
                                            {course.department}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {course.credits} credits
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={currentAssignment || "none"}
                                        onValueChange={(value) => {
                                            onAddToRequirement(
                                                course,
                                                value === "none" ? null : value
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
                                            {Object.entries(requirements).map(
                                                ([key, requirement]) => (
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
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-3 flex items-center justify-center"
                                        onClick={() => onRemoveCourse(course)}
                                    >
                                        Remove
                                    </Button>
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
