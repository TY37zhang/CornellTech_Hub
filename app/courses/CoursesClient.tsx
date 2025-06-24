"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function CoursesClient({ initialCourses, initialTotal }: Props) {
    // Search & filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [programFilter, setProgramFilter] = useState("all");
    const [sortBy, setSortBy] = useState("popular");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 15;
    const [totalPages, setTotalPages] = useState(
        Math.max(1, Math.ceil(initialTotal / coursesPerPage))
    );

    // Data
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [filteredCourses, setFilteredCourses] =
        useState<Course[]>(initialCourses);

    // Modal
    const [showSortModal, setShowSortModal] = useState(false);
    const isFirstRender = useRef(true);

    // Fetch courses whenever any dependency changes (search, filters, sort, or page).
    // Skip the very first render so we don't duplicate the server-side request.
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();
                if (searchQuery) params.set("search", searchQuery);
                if (programFilter !== "all")
                    params.set("category", programFilter);
                params.set("limit", coursesPerPage.toString());
                params.set(
                    "offset",
                    ((currentPage - 1) * coursesPerPage).toString()
                );
                if (sortBy) params.set("sortBy", sortBy);

                const res = await fetch(`/api/courses?${params.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch courses");
                const data = await res.json();
                setCourses(data.courses);
                setFilteredCourses(data.courses);
                setTotalPages(Math.ceil(data.total / coursesPerPage));
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        fetchCourses();
    }, [searchQuery, programFilter, currentPage, sortBy]);

    // Handle responsive
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 900);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Helper to render stars
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-4 w-4 ${
                        i <= Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-muted text-muted-foreground"
                    }`}
                />
            );
        }
        return stars;
    };

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                {/* HERO */}
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                                Course Reviews
                            </h1>
                            <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                Find and share reviews for Cornell Tech courses
                                to help you make informed decisions.
                            </p>
                            <div className="w-full max-w-2xl relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search courses by name, professor, or keyword..."
                                    className="w-full pl-8 rounded-md border bg-background"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* FILTER BAR */}
                <section className="container px-4 py-6 md:px-6">
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
                                    <SelectTrigger className="min-w-[200px] whitespace-nowrap">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
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
                                >
                                    <Filter className="h-5 w-5" />
                                </Button>
                                {showSortModal && (
                                    <div
                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                                        onClick={() => setShowSortModal(false)}
                                    >
                                        <div
                                            className="bg-white dark:bg-background rounded-lg shadow-lg p-4 w-56"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <h3 className="font-bold text-lg mb-2 text-center">
                                                Sort by
                                            </h3>
                                            <ul className="space-y-2">
                                                {sortOptions.map((opt) => (
                                                    <li key={opt.value}>
                                                        <button
                                                            className={`w-full text-center px-3 py-2 rounded hover:bg-muted ${sortBy === opt.value ? "bg-muted font-bold" : ""}`}
                                                            onClick={() => {
                                                                setSortBy(
                                                                    opt.value
                                                                );
                                                                setCurrentPage(
                                                                    1
                                                                );
                                                                setShowSortModal(
                                                                    false
                                                                );
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
                                    <SelectTrigger className="min-w-[200px] whitespace-nowrap">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
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
                                    <SelectTrigger className="min-w-[200px] whitespace-nowrap">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[200px]">
                                        {sortOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* New Review CTA */}
                        <div className="flex items-center gap-2 ml-2">
                            <Link href="/courses/new-review">
                                {isMobile ? (
                                    <Button
                                        size="icon"
                                        aria-label="Add new review"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button className="gap-1">
                                        <PlusCircle className="h-4 w-4" />
                                        <span>New Review</span>
                                    </Button>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* COURSE GRID */}
                    <div className="mt-6">
                        {isLoading ? (
                            // skeletons
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <Card
                                        key={i}
                                        className="h-full overflow-hidden"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                                            <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-2" />
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <div className="space-y-2">
                                                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                                                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                                                <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-10">
                                <p className="text-red-500">{error}</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {filteredCourses.map((course, index) => (
                                    <Link
                                        href={`/courses/${course.id}`}
                                        key={`${course.id}-${course.professor}-${index}`}
                                        className="group w-full"
                                    >
                                        <Card className="h-full w-full overflow-hidden transition-all hover:border-primary">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="text-xl truncate">
                                                            {course.title}
                                                        </CardTitle>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                        {course.crossListed ? (
                                                            (() => {
                                                                const uniqueDepts =
                                                                    Array.from(
                                                                        new Set(
                                                                            course
                                                                                .crossListed
                                                                                ?.departments ??
                                                                                []
                                                                        )
                                                                    );
                                                                return uniqueDepts.map(
                                                                    (
                                                                        dept,
                                                                        idx
                                                                    ) => (
                                                                        <Badge
                                                                            key={`${dept}-${idx}`}
                                                                            variant={
                                                                                dept.toLowerCase() as any
                                                                            }
                                                                            className="min-w-[56px] justify-center text-center"
                                                                        >
                                                                            {dept.toUpperCase()}
                                                                        </Badge>
                                                                    )
                                                                );
                                                            })()
                                                        ) : (
                                                            <Badge
                                                                variant={
                                                                    course.category.toLowerCase() as any
                                                                }
                                                                className="min-w-[56px] justify-center text-center"
                                                            >
                                                                {course.category.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="flex items-center gap-1 text-sm flex-wrap">
                                                    <div className="flex">
                                                        {renderStars(
                                                            course.rating
                                                        )}
                                                    </div>
                                                    <span className="font-medium">
                                                        {course.rating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        ({course.reviewCount}{" "}
                                                        reviews)
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-3">
                                                    {(
                                                        [
                                                            [
                                                                "Difficulty",
                                                                course.difficulty,
                                                            ],
                                                            [
                                                                "Workload",
                                                                course.workload,
                                                            ],
                                                            [
                                                                "Value",
                                                                course.value,
                                                            ],
                                                        ] as [string, number][]
                                                    ).map(([label, val]) => (
                                                        <div
                                                            key={label}
                                                            className="flex items-center justify-between gap-4"
                                                        >
                                                            <span className="min-w-[80px] text-sm text-muted-foreground">
                                                                {label}
                                                            </span>
                                                            <div className="flex flex-1 items-center gap-3">
                                                                <div className="h-2.5 flex-1 rounded-full bg-muted">
                                                                    <div
                                                                        className="h-2.5 rounded-full bg-yellow-400 transition-all"
                                                                        style={{
                                                                            width: `${(val / 5) * 100}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="min-w-[40px] text-sm font-medium">
                                                                    {val.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-1">
                                                <p className="line-clamp-2 text-sm text-muted-foreground w-full">
                                                    "{course.review}"
                                                </p>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}

                                {filteredCourses.length === 0 && (
                                    <div className="col-span-full text-center py-10">
                                        <p className="text-muted-foreground">
                                            No courses found matching your
                                            search criteria.
                                        </p>
                                    </div>
                                )}
                            </div>
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
                                                setCurrentPage(
                                                    Math.max(1, currentPage - 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                            className="w-10 h-10 p-0"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                        <div className="flex items-center gap-1 text-base font-medium px-2 min-w-[60px] justify-center">
                                            {currentPage > 2 && (
                                                <span>...</span>
                                            )}
                                            <span>{currentPage}</span>
                                            <span className="mx-1">/</span>
                                            <span>{totalPages}</span>
                                            {currentPage < totalPages - 1 && (
                                                <span>...</span>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.min(
                                                        totalPages,
                                                        currentPage + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            aria-label="Next page"
                                            className="w-10 h-10 p-0"
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
                                            className="w-10 h-10 p-0"
                                        >
                                            <ChevronsLeft className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(1, prev - 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                            className="w-10 h-10 p-0"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {getVisiblePages(
                                                currentPage,
                                                totalPages
                                            ).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={
                                                        currentPage === page
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(page)
                                                    }
                                                    className="w-10 h-10"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        totalPages,
                                                        prev + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            aria-label="Next page"
                                            className="w-10 h-10 p-0"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentPage(totalPages)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            aria-label="Last page"
                                            className="w-10 h-10 p-0"
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
                <section className="container px-4 py-8 md:px-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Can't find what you're looking for?
                        </h2>
                        <p className="text-muted-foreground">
                            Help your fellow students by adding a review for a
                            course that's not listed yet.
                        </p>
                        <Link href="/courses/new-review">
                            <Button className="gap-1">
                                <PlusCircle className="h-4 w-4" />
                                <span>Add a New Course Review</span>
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
