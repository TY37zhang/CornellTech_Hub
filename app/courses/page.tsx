"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Pagination logic for visible page numbers
const getVisiblePages = (current: number, total: number): number[] => {
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    // Always show 5 buttons if possible
    if (current <= 3) {
        end = Math.min(5, total);
    } else if (current >= total - 2) {
        start = Math.max(1, total - 4);
    }
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
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

// Helper function to get category color
function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
        ceee: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        cs: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        ece: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        hadm: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-800/20 dark:text-yellow-400",
        info: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
        law: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-800/20 dark:text-indigo-400",
        orie: "bg-pink-100 text-pink-800 hover:bg-pink-100 dark:bg-pink-800/20 dark:text-pink-400",
        tech: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-800/20 dark:text-orange-400",
        techie: "bg-teal-100 text-teal-800 hover:bg-teal-100 dark:bg-teal-800/20 dark:text-teal-400",
        arch: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-800/20 dark:text-cyan-400",
        cee: "bg-lime-100 text-lime-800 hover:bg-lime-100 dark:bg-lime-800/20 dark:text-lime-400",
        cmbp: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-800/20 dark:text-emerald-400",
        cmpb: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        ctiv: "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-800/20 dark:text-rose-400",
        design: "bg-violet-100 text-violet-800 hover:bg-violet-100 dark:bg-violet-800/20 dark:text-violet-400",
        hbds: "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100 dark:bg-fuchsia-800/20 dark:text-fuchsia-400",
        hinf: "bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-800/20 dark:text-sky-400",
        hpec: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        iamp: "bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-800/20 dark:text-rose-400",
        nba: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-800/20 dark:text-indigo-400",
        nbay: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        pbsb: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        phar: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
        tpcm: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-800/20 dark:text-orange-400",
    };
    return (
        colors[category] ||
        "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/20 dark:text-gray-400"
    );
}

export default function CoursesPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [programFilter, setProgramFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [sortBy, setSortBy] = useState("popular");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const coursesPerPage = 15;

    // Courses state
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

    // Fetch courses from API
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();
                if (searchQuery) params.set("search", searchQuery);
                // Only apply program filter at the API level if it's not "all"
                if (programFilter !== "all")
                    params.set("category", programFilter);
                params.set("limit", coursesPerPage.toString());
                params.set(
                    "offset",
                    ((currentPage - 1) * coursesPerPage).toString()
                );
                // Add sortBy to API request
                if (sortBy) params.set("sortBy", sortBy);

                const response = await fetch(
                    `/api/courses?${params.toString()}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }
                const data = await response.json();
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

        fetchCourses();
    }, [searchQuery, currentPage, programFilter, sortBy]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 900);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
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
                {/* Hero + Search */}
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
                                        setCurrentPage(1); // Reset to first page on search
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabs + Course Grid */}
                <section className="container px-4 py-6 md:px-6">
                    <div className="flex w-full items-center justify-between">
                        {isMobile ? (
                            <div className="flex flex-row items-center gap-2 flex-1">
                                <Select
                                    value={programFilter}
                                    onValueChange={(value) => {
                                        setProgramFilter(value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="min-w-[200px] whitespace-nowrap">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Sort options"
                                    onClick={() =>
                                        alert("Open sort options modal")
                                    }
                                >
                                    <Filter className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                                <Select
                                    value={programFilter}
                                    onValueChange={(value) => {
                                        setProgramFilter(value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="min-w-[200px] whitespace-nowrap">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => {
                                        setSortBy(value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="min-w-[200px] whitespace-nowrap">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[200px]">
                                        <SelectItem value="recent">
                                            Most Recent
                                        </SelectItem>
                                        <SelectItem value="popular">
                                            Most Popular
                                        </SelectItem>
                                        <SelectItem value="rating">
                                            Highest Rated
                                        </SelectItem>
                                        <SelectItem value="difficulty">
                                            Most Difficult
                                        </SelectItem>
                                        <SelectItem value="workload">
                                            Heaviest Workload
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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

                    {/* Course Grid */}
                    <div className="mt-6">
                        {isLoading ? (
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
                                {filteredCourses.map((course) => (
                                    <Link
                                        href={`/courses/${course.id}`}
                                        key={course.id}
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
                                                                // Get unique departments
                                                                const uniqueDepts =
                                                                    Array.from(
                                                                        new Set(
                                                                            course.crossListed.departments
                                                                        )
                                                                    );
                                                                return uniqueDepts.map(
                                                                    (
                                                                        dept,
                                                                        index
                                                                    ) => (
                                                                        <Badge
                                                                            key={`${dept}-${index}`}
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
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="min-w-[80px] text-sm text-muted-foreground">
                                                            Difficulty
                                                        </span>
                                                        <div className="flex flex-1 items-center gap-3">
                                                            <div className="h-2.5 flex-1 rounded-full bg-muted">
                                                                <div
                                                                    className="h-2.5 rounded-full bg-yellow-400 transition-all"
                                                                    style={{
                                                                        width: `${(course.difficulty / 5) * 100}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="min-w-[40px] text-sm font-medium">
                                                                {course.difficulty.toFixed(
                                                                    1
                                                                )}
                                                                /5
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="min-w-[80px] text-sm text-muted-foreground">
                                                            Workload
                                                        </span>
                                                        <div className="flex flex-1 items-center gap-3">
                                                            <div className="h-2.5 flex-1 rounded-full bg-muted">
                                                                <div
                                                                    className="h-2.5 rounded-full bg-yellow-400 transition-all"
                                                                    style={{
                                                                        width: `${(course.workload / 5) * 100}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="min-w-[40px] text-sm font-medium">
                                                                {course.workload.toFixed(
                                                                    1
                                                                )}
                                                                /5
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="min-w-[80px] text-sm text-muted-foreground">
                                                            Value
                                                        </span>
                                                        <div className="flex flex-1 items-center gap-3">
                                                            <div className="h-2.5 flex-1 rounded-full bg-muted">
                                                                <div
                                                                    className="h-2.5 rounded-full bg-yellow-400 transition-all"
                                                                    style={{
                                                                        width: `${(course.value / 5) * 100}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="min-w-[40px] text-sm font-medium">
                                                                {course.value.toFixed(
                                                                    1
                                                                )}
                                                                /5
                                                            </span>
                                                        </div>
                                                    </div>
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

                        {/* Pagination Controls */}
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
                                            ).map((page: number) => (
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

                {/* Add Review CTA */}
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
