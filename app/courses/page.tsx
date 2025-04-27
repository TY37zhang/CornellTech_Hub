"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Filter, Search, Star, PlusCircle } from "lucide-react";

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
}

export default function CoursesPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [programFilter, setProgramFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [sortBy, setSortBy] = useState("rating");
    const [activeTab, setActiveTab] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

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
                const response = await fetch(
                    `/api/courses?${params.toString()}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }
                const data = await response.json();
                setCourses(data);
                setFilteredCourses(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [searchQuery]);

    // Filter courses based on active tab
    useEffect(() => {
        if (activeTab === "all") {
            setFilteredCourses(courses);
        } else {
            const filtered = courses.filter(
                (course) =>
                    course.category.toLowerCase() === activeTab.toLowerCase()
            );
            setFilteredCourses(filtered);
        }
    }, [activeTab, courses]);

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
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabs + Course Grid */}
                <section className="container px-4 py-6 md:px-6">
                    <Tabs
                        defaultValue="all"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <div className="flex w-full items-center justify-between">
                            {isMobile ? (
                                <Select
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Courses
                                        </SelectItem>
                                        <SelectItem value="ceee">
                                            CEEE
                                        </SelectItem>
                                        <SelectItem value="cs">CS</SelectItem>
                                        <SelectItem value="ece">ECE</SelectItem>
                                        <SelectItem value="hadm">
                                            HADM
                                        </SelectItem>
                                        <SelectItem value="info">
                                            INFO
                                        </SelectItem>
                                        <SelectItem value="law">LAW</SelectItem>
                                        <SelectItem value="orie">
                                            ORIE
                                        </SelectItem>
                                        <SelectItem value="tech">
                                            TECH
                                        </SelectItem>
                                        <SelectItem value="techie">
                                            TECHIE
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <TabsList>
                                    <TabsTrigger value="all">
                                        All Courses
                                    </TabsTrigger>
                                    <TabsTrigger value="ceee">CEEE</TabsTrigger>
                                    <TabsTrigger value="cs">CS</TabsTrigger>
                                    <TabsTrigger value="ece">ECE</TabsTrigger>
                                    <TabsTrigger value="hadm">HADM</TabsTrigger>
                                    <TabsTrigger value="info">INFO</TabsTrigger>
                                    <TabsTrigger value="law">LAW</TabsTrigger>
                                    <TabsTrigger value="orie">ORIE</TabsTrigger>
                                    <TabsTrigger value="tech">TECH</TabsTrigger>
                                    <TabsTrigger value="techie">
                                        TECHIE
                                    </TabsTrigger>
                                </TabsList>
                            )}
                            <div className="flex items-center gap-2">
                                <Link href="/courses/new-review">
                                    <Button className="gap-1">
                                        <PlusCircle className="h-4 w-4" />
                                        {!isMobile && <span>New Review</span>}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Single dynamic content pane filtered by activeTab */}
                        <TabsContent value={activeTab} className="mt-6">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCourses.map((course) => (
                                        <Link
                                            href={`/courses/${course.id}`}
                                            key={course.id}
                                            className="group"
                                        >
                                            <Card className="h-full overflow-hidden transition-all hover:border-primary">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <CardTitle className="text-xl">
                                                                {course.title}
                                                            </CardTitle>
                                                            <CardDescription className="text-sm">
                                                                {
                                                                    course.professor
                                                                }
                                                            </CardDescription>
                                                        </div>
                                                        <Badge
                                                            className={
                                                                course.categoryColor
                                                            }
                                                        >
                                                            {course.category.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pb-3">
                                                    <div className="flex items-center gap-1 text-sm">
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
                                                            (
                                                            {course.reviewCount}{" "}
                                                            reviews)
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                Difficulty
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-24 rounded-full bg-muted">
                                                                    <div
                                                                        className="h-2 rounded-full bg-yellow-400"
                                                                        style={{
                                                                            width: `${
                                                                                course.difficulty *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {course.difficulty.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                Workload
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-24 rounded-full bg-muted">
                                                                    <div
                                                                        className="h-2 rounded-full bg-yellow-400"
                                                                        style={{
                                                                            width: `${
                                                                                course.workload *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span>
                                                                    {course.workload.toFixed(
                                                                        1
                                                                    )}
                                                                    /5
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                Value
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-24 rounded-full bg-muted">
                                                                    <div
                                                                        className="h-2 rounded-full bg-yellow-400"
                                                                        style={{
                                                                            width: `${
                                                                                course.value *
                                                                                20
                                                                            }%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span>
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
                                                    <p className="line-clamp-2 text-sm text-muted-foreground">
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
                        </TabsContent>
                    </Tabs>
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
