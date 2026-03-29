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
  isDemoMode?: boolean;
}

export default function SelectedCourses({
  selectedCourses,
  onRemoveCourse,
  requirements,
  onAddToRequirement,
  coursePlan,
  onCourseTaken,
  isDemoMode = false,
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
  const [showTakenCourses, setShowTakenCourses] = useState(false); // Always start with false

  // Initialize toggle state based on mode and localStorage
  useEffect(() => {
    const storageKey = isDemoMode ? "showTakenCoursesDemo" : "showTakenCourses";
    const stored = localStorage.getItem(storageKey);

    if (stored !== null) {
      setShowTakenCourses(stored === "true");
    } else {
      // Default behavior: false for demo mode, true for regular mode
      setShowTakenCourses(isDemoMode ? false : true);
    }
  }, [isDemoMode]);

  // Save to localStorage when state changes
  useEffect(() => {
    const storageKey = isDemoMode ? "showTakenCoursesDemo" : "showTakenCourses";
    localStorage.setItem(storageKey, String(showTakenCourses));
  }, [showTakenCourses, isDemoMode]);

  return (
    <Card className="p-6 w-full">
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
              <button
                id="show-taken-courses"
                onClick={() => setShowTakenCourses(!showTakenCourses)}
                className={`relative inline-flex h-6 w-11 items-center rounded-none transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:ring-offset-2 ${
                  showTakenCourses
                    ? "bg-[hsl(var(--tc-strong-border))]"
                    : "bg-surface-active"
                }`}
                role="switch"
                aria-checked={showTakenCourses}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-none bg-surface transition-transform ${
                    showTakenCourses ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
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
            <button
              id="show-taken-courses-mobile"
              onClick={() => setShowTakenCourses(!showTakenCourses)}
              className={`relative inline-flex h-6 w-11 items-center rounded-none transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:ring-offset-2 ${
                showTakenCourses
                  ? "bg-[hsl(var(--tc-strong-border))]"
                  : "bg-surface-active"
              }`}
              role="switch"
              aria-checked={showTakenCourses}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-none bg-surface transition-transform ${
                  showTakenCourses ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
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
              .filter((course) => showTakenCourses || !course.taken)
              .sort((a, b) => {
                // First sort by taken status (untaken first)
                if (!!a.taken !== !!b.taken) {
                  return a.taken ? 1 : -1;
                }
                // Then sort by course code
                return a.code.localeCompare(b.code);
              })
              .map((course) => {
                const currentAssignment = findCourseAssignment(course.id);
                return (
                  <div
                    key={course.id}
                    className="relative border border-subtle p-4 w-full"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-t1">{course.code}</h4>
                        <p className="text-sm text-t3 truncate">
                          {course.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveCourse(course)}
                        className="shrink-0 h-7 w-7 p-0 hover:bg-surface-active hover:text-t1"
                        aria-label="Remove course"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-t3 mb-3">
                      <span className="font-mono">
                        {course.department.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span className="font-mono whitespace-nowrap">
                        {course.credits} credits
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <Checkbox
                          id={`taken-${course.id}`}
                          checked={course.taken}
                          onCheckedChange={(checked) =>
                            onCourseTaken(course, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`taken-${course.id}`}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {course.taken ? "Taken" : "Taken?"}
                        </label>
                      </div>
                    </div>
                    {/* Requirement Assignment Dropdown - full width below */}
                    <Select
                      value={currentAssignment || "unassigned"}
                      onValueChange={(value) =>
                        onAddToRequirement(
                          course,
                          value === "unassigned" ? null : value,
                        )
                      }
                    >
                      <SelectTrigger className="w-full text-xs h-8">
                        <SelectValue placeholder="Assign to requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {Object.entries(requirements).map(([reqKey, req]) => (
                          <SelectItem key={reqKey} value={reqKey}>
                            {reqKey.replace(/([A-Z])/g, " $1").trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </Card>
  );
}
