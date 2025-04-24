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

// Sample course data
const coursesData: Course[] = [
    {
        id: "machine-learning",
        title: "Machine Learning",
        professor: "Prof. Serge Belongie",
        category: "cs",
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
        category: "tech",
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
        category: "techie",
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
        category: "info",
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
        category: "info",
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
        category: "law",
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

    // Filtered courses state
    const [filteredCourses, setFilteredCourses] =
        useState<Course[]>(coursesData);

    // Apply search, tab filter, and sorting
    useEffect(() => {
        let result = [...coursesData];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (course) =>
                    course.title.toLowerCase().includes(q) ||
                    course.professor.toLowerCase().includes(q)
            );
        }

        // Tab (category) filter
        if (activeTab !== "all") {
            result = result.filter((course) => course.category === activeTab);
        }

        // (Optional) program & semester filters…

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "rating":
                    return b.rating - a.rating;
                case "reviews":
                    return b.reviewCount - a.reviewCount;
                case "newest":
                    return 0;
                case "name":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        setFilteredCourses(result);
    }, [searchQuery, activeTab, programFilter, semesterFilter, sortBy]);

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
                                <TabsTrigger value="techie">TECHIE</TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <Link href="/courses/new-review">
                                    <Button className="gap-1">
                                        <PlusCircle className="h-4 w-4" />
                                        <span>New Review</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Single dynamic content pane filtered by activeTab */}
                        <TabsContent value={activeTab} className="mt-6">
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
                                                                />
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
                                                                />
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
                                                                />
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
