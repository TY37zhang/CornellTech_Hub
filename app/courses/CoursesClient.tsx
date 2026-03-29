"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { isStudent, isFaculty, isStaff } from "@/lib/roles";
import {
  Filter,
  Search,
  Star,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define course type
interface Course {
  id: string;
  title: string;
  professor: string;
  category:
    | "ceee"
    | "cs"
    | "ece"
    | "hadm"
    | "info"
    | "law"
    | "orie"
    | "tech"
    | "techie";
  rating: number;
  reviewCount: number;
  difficulty: number;
  workload: number;
  value: number;
  review: string;
  categoryColor: string;
  crossListed?: { departments: string[] };
}

interface Props {
  initialCourses: Course[];
  initialTotal: number;
}

// Pagination logic for visible page numbers
const getVisiblePages = (current: number, total: number): number[] => {
  const pages: number[] = [];
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  if (current <= 3) {
    end = Math.min(5, total);
  } else if (current >= total - 2) {
    start = Math.max(1, total - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
};

// Program options
const programOptions = [
  { value: "all", label: "All Programs" },
  { value: "arch", label: "ARCH" },
  { value: "cee", label: "CEE" },
  { value: "cmbp", label: "CMBP" },
  { value: "cmpb", label: "CMPB" },
  { value: "cs", label: "CS" },
  { value: "ctiv", label: "CTIV" },
  { value: "design", label: "DESIGN" },
  { value: "ece", label: "ECE" },
  { value: "hbds", label: "HBDS" },
  { value: "hinf", label: "HINF" },
  { value: "hpec", label: "HPEC" },
  { value: "iamp", label: "IAMP" },
  { value: "info", label: "INFO" },
  { value: "law", label: "LAW" },
  { value: "nba", label: "NBA" },
  { value: "nbay", label: "NBAY" },
  { value: "orie", label: "ORIE" },
  { value: "pbsb", label: "PBSB" },
  { value: "phar", label: "PHAR" },
  { value: "tech", label: "TECH" },
  { value: "techie", label: "TECHIE" },
  { value: "tpcm", label: "TPCM" },
];

// Sort options
const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "difficulty", label: "Most Difficult" },
  { value: "workload", label: "Heaviest Workload" },
];

function CoursesClient({ initialCourses, initialTotal }: Props) {
  // Authentication and role checking
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const canCreateReviews = !userRole || isStudent(userRole);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 15;
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil(initialTotal / coursesPerPage)),
  );

  // Data
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // Memoized filtered courses for performance
  const filteredCourses = useMemo(() => {
    return courses; // In this implementation, filtering is done server-side
  }, [courses]);

  // Modal
  const [showSortModal, setShowSortModal] = useState(false);
  const isFirstRender = useRef(true);

  // Debounced search to reduce API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoized fetch function
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
      if (programFilter !== "all") params.set("category", programFilter);
      params.set("limit", coursesPerPage.toString());
      params.set("offset", ((currentPage - 1) * coursesPerPage).toString());
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/courses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data.courses);
      setTotalPages(Math.ceil(data.total / coursesPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearchQuery,
    programFilter,
    currentPage,
    sortBy,
    coursesPerPage,
  ]);

  // Fetch courses whenever dependencies change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchCourses();
  }, [fetchCourses]);

  // Handle responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Helper to render stars - memoized for performance
  const renderStars = useCallback((rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-neutral-800 text-neutral-700"
          }`}
        />,
      );
    }
    return stars;
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-t1">
      <div className="flex-1">
        {/* HERO */}
        <section className="w-full border-b border-subtle">
          <div className="mx-auto max-w-[980px] px-6 pt-28 pb-12 md:pt-36 md:pb-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
              Courses
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Course Reviews.
            </h1>
            <p className="mt-3 text-base text-t3">Find and share reviews.</p>
            <div className="mt-8 w-full max-w-lg relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-t4" />
              <input
                type="search"
                placeholder="Search courses by name, professor, or keyword..."
                className="w-full pl-9 h-10 bg-surface-hover border border-strong text-t1 placeholder:text-t4 font-mono text-sm focus:outline-none focus:border-cta-outline rounded-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="w-full border-b border-subtle">
          <div className="mx-auto max-w-[980px] px-6 py-4">
            <div className="flex w-full items-center justify-between">
              {/* Program filter & sort */}
              {isMobile ? (
                <div className="flex flex-row items-center gap-2 flex-1">
                  {/* Program */}
                  <Select
                    value={programFilter}
                    onValueChange={(v) => {
                      setProgramFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="min-w-[200px] whitespace-nowrap bg-surface-hover border-strong text-t2 rounded-none font-mono text-sm">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-raised border border-strong rounded-none">
                      {programOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-t2 font-mono text-sm focus:bg-surface-active focus:text-t1"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Sort button opens modal */}
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Sort options"
                    onClick={() => setShowSortModal(true)}
                    className="bg-surface-hover border-strong text-t2 rounded-none hover:bg-surface-active hover:text-t1"
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                  {showSortModal && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                      onClick={() => setShowSortModal(false)}
                    >
                      <div
                        className="bg-surface-raised border border-strong p-4 w-56 rounded-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="font-mono text-sm font-bold text-t1 mb-3 text-center uppercase tracking-[0.1em]">
                          Sort by
                        </h3>
                        <ul className="space-y-1">
                          {sortOptions.map((opt) => (
                            <li key={opt.value}>
                              <button
                                className={`w-full text-center px-3 py-2 font-mono text-sm rounded-none transition-colors ${
                                  sortBy === opt.value
                                    ? "bg-cta text-cta font-bold"
                                    : "text-t2 hover:bg-surface-active hover:text-t1"
                                }`}
                                onClick={() => {
                                  setSortBy(opt.value);
                                  setCurrentPage(1);
                                  setShowSortModal(false);
                                }}
                              >
                                {opt.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-row items-center gap-4">
                  {/* Program desktop */}
                  <Select
                    value={programFilter}
                    onValueChange={(v) => {
                      setProgramFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="min-w-[200px] whitespace-nowrap bg-surface-hover border-strong text-t2 rounded-none font-mono text-sm">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-raised border border-strong rounded-none">
                      {programOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-t2 font-mono text-sm focus:bg-surface-active focus:text-t1"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Sort desktop */}
                  <Select
                    value={sortBy}
                    onValueChange={(v) => {
                      setSortBy(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="min-w-[200px] whitespace-nowrap bg-surface-hover border-strong text-t2 rounded-none font-mono text-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-raised border border-strong rounded-none min-w-[200px]">
                      {sortOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-t2 font-mono text-sm focus:bg-surface-active focus:text-t1"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* New Review CTA - Only show for students and unauthenticated users */}
              {canCreateReviews && (
                <div className="flex items-center gap-2 ml-2">
                  <Link href="/courses/new-review">
                    {isMobile ? (
                      <Button
                        size="icon"
                        aria-label="Add new review"
                        className="bg-cta text-cta hover:bg-cta-hover rounded-none"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button className="gap-1 bg-cta text-cta hover:bg-cta-hover rounded-none font-mono text-sm">
                        <PlusCircle className="h-4 w-4" />
                        <span>New Review</span>
                      </Button>
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COURSE LIST */}
        <section className="w-full">
          <div className="mx-auto max-w-[980px] px-6 py-6">
            {isLoading ? (
              // skeletons
              <div className="divide-y divide-subtle border-t border-subtle">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="py-5 px-1 space-y-2">
                    <div className="h-5 w-2/3 bg-surface-active animate-pulse" />
                    <div className="h-4 w-1/2 bg-surface-hover animate-pulse" />
                    <div className="h-3 w-1/3 bg-surface-hover animate-pulse" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400 font-mono text-sm">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 font-mono text-sm"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-subtle border-t border-subtle">
                  {filteredCourses.map((course, index) => (
                    <CourseCard
                      key={`${course.id}-${course.professor}-${index}`}
                      course={course}
                      renderStars={renderStars}
                    />
                  ))}
                </div>

                {filteredCourses.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-t3 font-mono text-sm">
                      No courses found matching your search criteria.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* PAGINATION */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="w-full flex justify-center mt-8">
                {isMobile ? (
                  <nav
                    className="flex items-center gap-2"
                    aria-label="Pagination"
                  >
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-1 font-mono text-sm text-t2 px-2 min-w-[60px] justify-center">
                      {currentPage > 2 && <span>...</span>}
                      <span className="text-t1">{currentPage}</span>
                      <span className="mx-1">/</span>
                      <span>{totalPages}</span>
                      {currentPage < totalPages - 1 && <span>...</span>}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                      className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </nav>
                ) : (
                  <nav
                    className="flex items-center gap-2"
                    aria-label="Pagination"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      aria-label="First page"
                      className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {getVisiblePages(currentPage, totalPages).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 font-mono text-sm ${
                            currentPage === page
                              ? "bg-cta text-cta hover:bg-cta-hover rounded-none"
                              : "rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                      className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      aria-label="Last page"
                      className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                    >
                      <ChevronsRight className="w-5 h-5" />
                    </Button>
                  </nav>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full border-t border-subtle">
          <div className="mx-auto max-w-[980px] px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="mt-2 text-t3 text-sm">
              Help your fellow students by adding a review.
            </p>
            <Link href="/courses/new-review">
              <Button className="mt-6 h-11 rounded-none px-6 font-mono text-sm bg-cta text-cta hover:bg-cta-hover">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add a New Course Review
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Memoized course card component for better performance
const CourseCard = memo(
  ({
    course,
    renderStars,
  }: {
    course: Course;
    renderStars: (rating: number) => JSX.Element[];
  }) => {
    const uniqueDepts = course.crossListed
      ? Array.from(
          new Set(
            (course.crossListed?.departments ?? [])
              .filter(Boolean)
              .map((dept) => dept.trim().toUpperCase()),
          ),
        )
      : null;

    return (
      <Link
        href={`/courses/${course.id}`}
        className="group block border-b border-subtle py-5 px-1 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-t1 group-hover:text-t1 transition-colors truncate">
              {course.title}
            </h3>
            <p className="text-sm text-t3 mt-1 line-clamp-1">
              &ldquo;{course.review}&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {uniqueDepts ? (
              uniqueDepts.map((dept, idx) => (
                <span
                  key={`${dept}-${idx}`}
                  className="inline-flex items-center justify-center px-2 py-0.5 bg-surface-active border border-strong text-t2 font-mono text-xs rounded-none"
                >
                  {dept}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center justify-center px-2 py-0.5 bg-surface-active border border-strong text-t2 font-mono text-xs rounded-none">
                {course.category.toUpperCase()}
              </span>
            )}
            <span className="font-mono text-sm text-t2">
              {course.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 font-mono text-xs text-t4">
          <span>difficulty {course.difficulty.toFixed(1)}</span>
          <span>workload {course.workload.toFixed(1)}</span>
          <span>value {course.value.toFixed(1)}</span>
          <span>{course.reviewCount} reviews</span>
        </div>
      </Link>
    );
  },
);

CourseCard.displayName = "CourseCard";

export default memo(CoursesClient);
