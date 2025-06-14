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
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

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

    // Collapsible state
    const [collapsed, setCollapsed] = useState(false);
    const [showTakenCourses, setShowTakenCourses] = useState(true);

    // Persist toggle state in localStorage
    useEffect(() => {
        const stored = localStorage.getItem("showTakenCourses");
        if (stored !== null) {
            setShowTakenCourses(stored === "true");
        }
    }, []);
    useEffect(() => {
        localStorage.setItem("showTakenCourses", String(showTakenCourses));
    }, [showTakenCourses]);

    return (
        <Card className="p-6 w-full overflow-hidden">
            <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        <h3 className="text-lg font-semibold flex items-center gap-2 whitespace-nowrap truncate">
                            <button
                                type="button"
                                aria-label={collapsed ? "Expand" : "Collapse"}
                                onClick={() => setCollapsed((c) => !c)}
                                className="focus:outline-none"
                            >
                                {collapsed ? (
                                    <ChevronRight className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </button>
                            Selected Courses
                        </h3>
                        {/* Toggle: Desktop only */}
                        <div className="hidden md:flex items-center space-x-2 ml-auto">
                            <Switch
                                id="show-taken-courses"
                                checked={showTakenCourses}
                                onCheckedChange={setShowTakenCourses}
                            />
                            <label
                                htmlFor="show-taken-courses"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Display taken courses
                            </label>
                        </div>
                    </div>
                </div>
                {/* Toggle: Mobile only, below header, only if expanded */}
                {!collapsed && (
                    <div className="flex md:hidden items-center space-x-2 mb-2">
                        <Switch
                            id="show-taken-courses-mobile"
                            checked={showTakenCourses}
                            onCheckedChange={setShowTakenCourses}
                        />
                        <label
                            htmlFor="show-taken-courses-mobile"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Display taken courses
                        </label>
                    </div>
                )}
                {/* Course List */}
                {!collapsed && (
                    <div className="grid gap-2">
                        {selectedCourses
                            .slice()
                            .filter(
                                (course) => showTakenCourses || !course.taken
                            )
                            .sort((a, b) => {
                                // First sort by taken status (untaken first)
                                if (!!a.taken !== !!b.taken) {
                                    return a.taken ? 1 : -1;
                                }
                                // Then sort by course code
                                return a.code.localeCompare(b.code);
                            })
                            .map((course) => {
                                const currentAssignment = findCourseAssignment(
                                    course.id
                                );
                                return (
                                    <div
                                        key={course.id}
                                        className="relative flex flex-col space-y-2 p-4 border rounded-lg w-full overflow-x-auto sm:overflow-visible"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onRemoveCourse(course)
                                            }
                                            className="absolute top-2 right-2 z-10"
                                            aria-label="Remove course"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                                            <div className="min-w-0 flex-1 w-full">
                                                <h4 className="font-medium truncate w-full mb-1">
                                                    {course.code}
                                                </h4>
                                                <p className="text-sm text-gray-600 truncate w-full mb-2">
                                                    {course.name}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 w-full">
                                                    <span>
                                                        {course.department}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="whitespace-nowrap">
                                                        {course.credits} credits
                                                    </span>
                                                    <div className="flex items-center space-x-2 ml-2">
                                                        <Checkbox
                                                            id={`taken-${course.id}`}
                                                            checked={
                                                                course.taken
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                onCourseTaken(
                                                                    course,
                                                                    checked as boolean
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`taken-${course.id}`}
                                                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {course.taken
                                                                ? "Taken"
                                                                : "Taken?"}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Requirement Assignment Dropdown - right side */}
                                            <div className="flex-shrink-0 flex items-center justify-end min-w-[180px] mt-4 sm:mt-0">
                                                <Select
                                                    value={
                                                        currentAssignment ||
                                                        "unassigned"
                                                    }
                                                    onValueChange={(value) =>
                                                        onAddToRequirement(
                                                            course,
                                                            value ===
                                                                "unassigned"
                                                                ? null
                                                                : value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Assign to requirement" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">
                                                            Unassigned
                                                        </SelectItem>
                                                        {Object.entries(
                                                            requirements
                                                        ).map(
                                                            ([reqKey, req]) => (
                                                                <SelectItem
                                                                    key={reqKey}
                                                                    value={
                                                                        reqKey
                                                                    }
                                                                >
                                                                    {reqKey
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
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </Card>
    );
}
