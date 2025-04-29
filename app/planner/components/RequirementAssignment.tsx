"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

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

interface RequirementAssignmentProps {
    selectedCourses: Course[];
    requirements: { [key: string]: Requirement };
    onAddToRequirement: (course: Course, requirementKey: string | null) => void;
    coursePlan: { [key: string]: Course[] };
}

export default function RequirementAssignment({
    selectedCourses,
    requirements,
    onAddToRequirement,
    coursePlan,
}: RequirementAssignmentProps) {
    // Track which requirement each course is assigned to
    const [courseAssignments, setCourseAssignments] = useState<{
        [courseId: string]: string;
    }>({});

    const handleRequirementClick = (course: Course, requirementKey: string) => {
        if (courseAssignments[course.id] === requirementKey) {
            // If clicking the same requirement, deselect it
            const newAssignments = { ...courseAssignments };
            delete newAssignments[course.id];
            setCourseAssignments(newAssignments);
            // Remove from the requirement in parent component
            onAddToRequirement(course, null);
        } else {
            // If clicking a different requirement, update the assignment
            setCourseAssignments({
                ...courseAssignments,
                [course.id]: requirementKey,
            });
            // Update in parent component
            onAddToRequirement(course, requirementKey);
        }
    };

    // Find which requirement each course is currently assigned to
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
                <h3 className="text-lg font-semibold">
                    Add Selected Courses to Requirement
                </h3>
                <div className="grid gap-4">
                    {selectedCourses.map((course) => (
                        <div key={course.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="text-lg font-medium">
                                        {course.code}
                                    </div>
                                    <div className="text-base text-muted-foreground">
                                        {course.name}
                                    </div>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="text-base"
                                >
                                    {course.credits} credits
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {Object.entries(requirements).map(([key]) => {
                                    const isAssigned =
                                        findCourseAssignment(course.id) === key;
                                    return (
                                        <Button
                                            key={key}
                                            variant={
                                                isAssigned
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                handleRequirementClick(
                                                    course,
                                                    key
                                                )
                                            }
                                        >
                                            {isAssigned
                                                ? "Remove from"
                                                : "Add to"}{" "}
                                            {key
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {selectedCourses.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            Select courses from the search above to assign them
                            to requirements
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
