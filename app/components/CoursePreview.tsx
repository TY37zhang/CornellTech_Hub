"use client";

import { memo } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  rating: number;
}

interface CoursePreviewProps {
  topCourses: Course[];
  topCourseError: string | null;
}

const RatingDot = memo(({ rating }: { rating: number }) => {
  const color =
    rating >= 4 ? "bg-green-500" : rating >= 3 ? "bg-yellow-500" : "bg-red-500";

  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
});

RatingDot.displayName = "RatingDot";

function CoursePreview({ topCourses, topCourseError }: CoursePreviewProps) {
  if (topCourseError) {
    return (
      <div className="w-full">
        <p className="font-mono text-sm text-red-500">{topCourseError}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="divide-y divide-white/[0.06]">
        {topCourses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-sm text-neutral-300 truncate pr-4">
              {course.title}
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <RatingDot rating={course.rating} />
              <span className="font-mono text-sm text-neutral-400">
                {course.rating.toFixed(1)}
              </span>
            </span>
          </Link>
        ))}
      </div>
      <div className="pt-4 px-4">
        <Link
          href="/courses"
          className="text-neutral-500 hover:text-white text-sm font-mono transition-colors"
        >
          View All Courses →
        </Link>
      </div>
    </div>
  );
}

export default memo(CoursePreview);
