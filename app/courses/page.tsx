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
    category: "core" | "technical" | "studio" | "business";
    rating: number;
    reviewCount: number;
    difficulty: number;
    workload: number;
    value: number;
    review: string;
    categoryColor: string;
}

// Sample course data
const coursesData: Course[] = [
    {
        id: "machine-learning",
        title: "Machine Learning",
        professor: "Prof. Serge Belongie",
        category: "technical",
        rating: 4.0,
        reviewCount: 24,
        difficulty: 7.5,
        workload: 8.0,
        value: 8.5,
        review: "Great course that covers both theory and practical applications. Challenging but rewarding.",
        categoryColor:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
    },
    {
        id: "product-studio",
        title: "Product Studio",
        professor: "Prof. David Tisch",
        category: "studio",
        rating: 4.9,
        reviewCount: 32,
        difficulty: 6.5,
        workload: 9.0,
        value: 9.5,
        review: "The most valuable course at Cornell Tech. Real-world experience working with companies on actual problems.",
        categoryColor:
            "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
    },
    {
        id: "business-fundamentals",
        title: "Business Fundamentals",
        professor: "Prof. Michael Gruber",
        category: "business",
        rating: 4.2,
        reviewCount: 18,
        difficulty: 5.5,
        workload: 6.0,
        value: 8.0,
        review: "Essential knowledge for tech entrepreneurs. Good balance of theory and practical case studies.",
        categoryColor:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
    },
    {
        id: "hci",
        title: "Human-Computer Interaction",
        professor: "Prof. Wendy Ju",
        category: "technical",
        rating: 4.7,
        reviewCount: 15,
        difficulty: 6.0,
        workload: 7.0,
        value: 9.0,
        review: "Fascinating course that changes how you think about design. Highly recommended for all students.",
        categoryColor:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
    },
    {
        id: "startup-systems",
        title: "Startup Systems",
        professor: "Prof. Vitaly Shmatikov",
        category: "technical",
        rating: 3.4,
        reviewCount: 22,
        difficulty: 8.5,
        workload: 9.0,
        value: 6.5,
        review: "Very challenging course with a heavy workload. Good for those who want to dive deep into systems.",
        categoryColor:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
    },
    {
        id: "leadership",
        title: "Leadership in Digital Transformation",
        professor: "Prof. Deborah Estrin",
        category: "core",
        rating: 4.3,
        reviewCount: 19,
        difficulty: 5.0,
        workload: 5.5,
        value: 8.5,
        review: "Insightful discussions and great guest speakers. Helps develop important soft skills for tech leaders.",
        categoryColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
    },
];

export default function CoursesPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [programFilter, setProgramFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [sortBy, setSortBy] = useState("rating");
    const [activeTab, setActiveTab] = useState("all");

    // Filtered and sorted courses
    const [filteredCourses, setFilteredCourses] =
        useState<Course[]>(coursesData);

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...coursesData];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (course) =>
                    course.title.toLowerCase().includes(query) ||
                    course.professor.toLowerCase().includes(query)
            );
        }

        // Apply category filter (tab)
        if (activeTab !== "all") {
            result = result.filter((course) => course.category === activeTab);
        }

        // Apply program filter (not implemented in the data model, just for demonstration)
        if (programFilter !== "all") {
            // In a real app, you would filter by program here
        }

        // Apply semester filter (not implemented in the data model, just for demonstration)
        if (semesterFilter !== "all") {
            // In a real app, you would filter by semester here
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "rating":
                    return b.rating - a.rating;
                case "reviews":
                    return b.reviewCount - a.reviewCount;
                case "newest":
                    // In a real app, you would sort by date here
                    return 0;
                case "name":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        setFilteredCourses(result);
    }, [searchQuery, programFilter, semesterFilter, sortBy, activeTab]);

    // Render star rating
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars.push(
                    <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                );
            } else {
                stars.push(
                    <Star
                        key={i}
                        className="h-4 w-4 fill-muted text-muted-foreground"
                    />
                );
            }
        }
        return stars;
    };

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Course Reviews
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                    Find and share reviews for Cornell Tech
                                    courses to help you make informed decisions.
                                </p>
                            </div>
                            <div className="w-full max-w-2xl space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search courses by name, professor, or keyword..."
                                        className="w-full bg-background pl-8 rounded-md border"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1"
                                    >
                                        <Filter className="h-3.5 w-3.5" />
                                        <span>Filters</span>
                                    </Button>
                                    <Select
                                        value={programFilter}
                                        onValueChange={setProgramFilter}
                                    >
                                        <SelectTrigger className="h-8 w-[130px]">
                                            <SelectValue placeholder="Program" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Programs
                                            </SelectItem>
                                            <SelectItem value="meng">
                                                MEng
                                            </SelectItem>
                                            <SelectItem value="mba">
                                                MBA
                                            </SelectItem>
                                            <SelectItem value="llm">
                                                LLM
                                            </SelectItem>
                                            <SelectItem value="health">
                                                Health Tech
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={semesterFilter}
                                        onValueChange={setSemesterFilter}
                                    >
                                        <SelectTrigger className="h-8 w-[130px]">
                                            <SelectValue placeholder="Semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Semesters
                                            </SelectItem>
                                            <SelectItem value="fall2023">
                                                Fall 2023
                                            </SelectItem>
                                            <SelectItem value="spring2023">
                                                Spring 2023
                                            </SelectItem>
                                            <SelectItem value="fall2022">
                                                Fall 2022
                                            </SelectItem>
                                            <SelectItem value="spring2022">
                                                Spring 2022
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={sortBy}
                                        onValueChange={setSortBy}
                                    >
                                        <SelectTrigger className="h-8 w-[130px]">
                                            <SelectValue placeholder="Sort By" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating">
                                                Highest Rated
                                            </SelectItem>
                                            <SelectItem value="reviews">
                                                Most Reviews
                                            </SelectItem>
                                            <SelectItem value="newest">
                                                Newest First
                                            </SelectItem>
                                            <SelectItem value="name">
                                                Course Name
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <Tabs
                        defaultValue="all"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="all">
                                    All Courses
                                </TabsTrigger>
                                <TabsTrigger value="core">Core</TabsTrigger>
                                <TabsTrigger value="technical">
                                    Technical
                                </TabsTrigger>
                                <TabsTrigger value="studio">Studio</TabsTrigger>
                                <TabsTrigger value="business">
                                    Business
                                </TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <Button className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>New Review</span>
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="all" className="mt-6">
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
                                                            {course.professor}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            course.categoryColor
                                                        }
                                                    >
                                                        {course.category
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            course.category.slice(
                                                                1
                                                            )}
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
                                                        ({course.reviewCount}{" "}
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
                                                                    className="h-2 w-[75%] rounded-full bg-yellow-400"
                                                                    style={{
                                                                        width: `${
                                                                            course.difficulty *
                                                                            10
                                                                        }%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span>
                                                                {course.difficulty.toFixed(
                                                                    1
                                                                )}
                                                                /10
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
                                                                    className="h-2 w-[80%] rounded-full bg-yellow-400"
                                                                    style={{
                                                                        width: `${
                                                                            course.workload *
                                                                            10
                                                                        }%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span>
                                                                {course.workload.toFixed(
                                                                    1
                                                                )}
                                                                /10
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
                                                                    className="h-2 w-[85%] rounded-full bg-yellow-400"
                                                                    style={{
                                                                        width: `${
                                                                            course.value *
                                                                            10
                                                                        }%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span>
                                                                {course.value.toFixed(
                                                                    1
                                                                )}
                                                                /10
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
                        </TabsContent>

                        <TabsContent value="core" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Core courses content is handled by the filtered courses in the "all" tab */}
                            </div>
                        </TabsContent>

                        <TabsContent value="technical" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Technical courses content is handled by the filtered courses in the "all" tab */}
                            </div>
                        </TabsContent>

                        <TabsContent value="studio" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Studio courses content is handled by the filtered courses in the "all" tab */}
                            </div>
                        </TabsContent>

                        <TabsContent value="business" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Business courses content is handled by the filtered courses in the "all" tab */}
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>

                <section className="container px-4 py-8 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Can't find what you're looking for?
                            </h2>
                            <p className="text-muted-foreground">
                                Help your fellow students by adding a review for
                                a course that's not listed yet.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button className="gap-1">
                                <PlusCircle className="h-4 w-4" />
                                <span>Add a New Course Review</span>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
