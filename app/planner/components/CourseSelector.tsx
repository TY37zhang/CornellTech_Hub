"use client";

import React, { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Loader2, Plus } from "lucide-react";

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
  sampleCourses?: Course[];
}

export default function CourseSelector({
  requirement,
  selectedCourses,
  onSelectCourse,
  searchQuery,
  sampleCourses,
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
        let data: Course[];

        if (sampleCourses) {
          // Use sample courses for demo mode
          const query = debouncedSearch.toLowerCase();
          data = sampleCourses.filter(
            (course) =>
              course.code.toLowerCase().includes(query) ||
              course.name.toLowerCase().includes(query) ||
              course.department.toLowerCase().includes(query),
          );
        } else {
          // Use API for authenticated users
          const response = await fetch(
            `/api/courses/search?q=${encodeURIComponent(debouncedSearch)}`,
          );
          if (!response.ok) {
            throw new Error("Failed to fetch courses");
          }
          data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }
        }

        setSearchResults(
          data.filter(
            (course: Course) =>
              !selectedCourses.some((selected) => selected.id === course.id),
          ),
        );
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch courses",
        );
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [debouncedSearch, selectedCourses, sampleCourses]);

  if (!searchQuery) return null;

  return (
    <div ref={containerRef} className="space-y-2 ml-9">
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Searching courses...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : searchResults.length > 0 ? (
        <div className="grid gap-3 grid-cols-2">
          {searchResults.map((course) => (
            <div
              key={course.id}
              onClick={() => {
                onSelectCourse(course);
                setSearchResults([]);
              }}
              className="relative p-3 border rounded-none hover:bg-accent/10 hover:border-accent hover:shadow-sm transition-all cursor-pointer group bg-surface"
            >
              <div className="w-full">
                <div className="font-medium text-base truncate">
                  {course.name}
                </div>
                <div className="text-sm text-t3 mt-1">{course.code}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {course.department}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {course.credits} cr
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
