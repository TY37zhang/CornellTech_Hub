"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BookOpen,
    Filter,
    MessageSquare,
    PlusCircle,
    Search,
    Tag,
    ThumbsUp,
    TrendingUp,
    Users,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getForumPosts, getForumStats, getTopContributors } from "./actions";

// Define thread type
interface Thread {
    id: string;
    title: string;
    author: {
        name: string;
        avatar: string;
        initials: string;
    };
    category: string;
    categoryColor: string;
    content: string;
    tags: string[];
    replies: number;
    likes: number;
    views: number;
    badge?: {
        text: string;
        color: string;
    };
    createdAt: string;
    isHot: boolean;
    isNew: boolean;
    hotScore: number;
}

// Helper function to get category color
function getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
        Academics:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        Career: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        "Campus Life":
            "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400",
        Technology:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        Events: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-800/20 dark:text-yellow-400",
        General:
            "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-800/20 dark:text-orange-400",
    };
    return colors[category] || colors.General;
}

// Helper function to format date
function formatDate(date: string): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Helper function to get initials
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

// Add this function before the ForumPage component
function calculateHotScore(thread: {
    likes: number;
    replies: number;
    views: number;
    createdAt: string;
}): { isHot: boolean; score: number } {
    const now = new Date();
    const threadDate = new Date(thread.createdAt);
    const hoursSinceCreation =
        (now.getTime() - threadDate.getTime()) / (1000 * 60 * 60);

    // Weights for different factors
    const weights = {
        likes: 1,
        replies: 1.5,
        views: 0.2,
        recency: 2,
    };

    // Calculate individual scores
    const likeScore = thread.likes * weights.likes;
    const replyScore = thread.replies * weights.replies;
    const viewScore = thread.views * weights.views;

    // Recency boost (decreases as thread gets older, max boost is 100)
    const recencyBoost = Math.max(
        0,
        100 - (hoursSinceCreation / 24) * weights.recency
    );

    // Calculate total score
    const totalScore = likeScore + replyScore + viewScore + recencyBoost;

    // Dynamic threshold based on time
    const threshold = 50 + (hoursSinceCreation / 24) * 10; // Threshold increases over time

    return {
        isHot: totalScore > threshold,
        score: totalScore,
    };
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

export default function ForumPage() {
    // State for search and filters
    const [threads, setThreads] = useState<Thread[]>([]);
    const [forumStats, setForumStats] = useState<any>(null);
    const [topContributors, setTopContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const threadsPerPage = 10;
    const [activeTab, setActiveTab] = useState("all");
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch threads, stats, and top contributors on component mount
    useEffect(() => {
        async function fetchData() {
            try {
                const offset = (currentPage - 1) * threadsPerPage;
                const params = new URLSearchParams({
                    search: searchQuery,
                    limit: threadsPerPage.toString(),
                    offset: offset.toString(),
                });
                const res = await fetch(
                    `/api/forum/posts?${params.toString()}`
                );

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(
                        errorData.error || `HTTP error! status: ${res.status}`
                    );
                }

                const postsData = await res.json();
                const [stats, contributors] = await Promise.all([
                    getForumStats(),
                    getTopContributors(),
                ]);

                if (!postsData.success) {
                    throw new Error(postsData.error || "Failed to fetch posts");
                }

                if (!Array.isArray(postsData.posts)) {
                    throw new Error(
                        "Invalid response format: posts array not found"
                    );
                }

                const formattedThreads: Thread[] = postsData.posts
                    .map((post: any) => {
                        if (!post || typeof post !== "object") {
                            console.error("Invalid post data:", post);
                            return null;
                        }

                        try {
                            const hotStatus = calculateHotScore({
                                likes: post.like_count || 0,
                                replies: post.reply_count || 0,
                                views: post.view_count || 0,
                                createdAt:
                                    post.created_at || new Date().toISOString(),
                            });

                            return {
                                id: post.id || "",
                                title: post.title || "",
                                author: {
                                    name: post.author_name || "Anonymous",
                                    avatar:
                                        post.author_avatar ||
                                        "/placeholder.svg?height=32&width=32",
                                    initials: getInitials(
                                        post.author_name || "Anonymous"
                                    ),
                                },
                                category: post.category_name || "Uncategorized",
                                categoryColor: getCategoryColor(
                                    post.category_name || "Uncategorized"
                                ),
                                content: post.content || "",
                                tags: Array.isArray(post.tags) ? post.tags : [],
                                replies: post.reply_count || 0,
                                likes: post.like_count || 0,
                                views: post.view_count || 0,
                                createdAt: formatDate(
                                    post.created_at || new Date().toISOString()
                                ),
                                isHot: hotStatus.isHot,
                                hotScore: hotStatus.score,
                                isNew:
                                    new Date(
                                        post.created_at || Date.now()
                                    ).getTime() >
                                    Date.now() - 7 * 24 * 60 * 60 * 1000,
                            };
                        } catch (error) {
                            console.error(
                                "Error formatting post:",
                                error,
                                post
                            );
                            return null;
                        }
                    })
                    .filter(Boolean) as Thread[];

                setThreads(formattedThreads);
                setForumStats(stats);
                setTopContributors(contributors);
                setTotalPages(Math.ceil(postsData.total / threadsPerPage));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch data"
                );
                setLoading(false);
            }
        }

        fetchData();
    }, [searchQuery, currentPage]);

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

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...threads];

        // Apply tab filter
        if (activeTab !== "all") {
            result = result.filter((thread) => thread.category === activeTab);
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            result = result.filter(
                (thread) => thread.category.toLowerCase() === selectedCategory
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        });

        setFilteredThreads(result);
    }, [activeTab, selectedCategory, threads]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-lg">Loading forum posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="rounded-full h-32 w-32 mx-auto mb-4">
                        <ExclamationTriangleIcon className="h-full w-full text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">
                        Error Loading Forum
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {error}
                    </p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            fetchData();
                        }}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Student Forum
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                    Connect with fellow Cornell Tech students,
                                    ask questions, and share knowledge.
                                </p>
                            </div>
                            <div className="w-full max-w-2xl space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search discussions by topic, keyword, or author..."
                                        className="w-full bg-background pl-8 rounded-md border"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="w-full py-6">
                    <div className="container px-4 md:px-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Discussions
                            </h2>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1">
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
                                                        All Discussions
                                                    </SelectItem>
                                                    <SelectItem value="Academics">
                                                        Academics
                                                    </SelectItem>
                                                    <SelectItem value="Career">
                                                        Career
                                                    </SelectItem>
                                                    <SelectItem value="Campus Life">
                                                        Campus Life
                                                    </SelectItem>
                                                    <SelectItem value="Technology">
                                                        Technology
                                                    </SelectItem>
                                                    <SelectItem value="Events">
                                                        Events
                                                    </SelectItem>
                                                    <SelectItem value="General">
                                                        General
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <TabsList>
                                                <TabsTrigger value="all">
                                                    All Discussions
                                                </TabsTrigger>
                                                <TabsTrigger value="Academics">
                                                    Academics
                                                </TabsTrigger>
                                                <TabsTrigger value="Career">
                                                    Career
                                                </TabsTrigger>
                                                <TabsTrigger value="Campus Life">
                                                    Campus Life
                                                </TabsTrigger>
                                                <TabsTrigger value="Technology">
                                                    Technology
                                                </TabsTrigger>
                                                <TabsTrigger value="Events">
                                                    Events
                                                </TabsTrigger>
                                                <TabsTrigger value="General">
                                                    General
                                                </TabsTrigger>
                                            </TabsList>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Link href="/forum/create">
                                                <Button className="gap-1">
                                                    <PlusCircle className="h-4 w-4" />
                                                    {!isMobile && (
                                                        <span>
                                                            New Discussion
                                                        </span>
                                                    )}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    <TabsContent
                                        value={activeTab}
                                        className="mt-6"
                                    >
                                        <div className="space-y-4">
                                            {filteredThreads.length > 0 ? (
                                                <div className="grid gap-4">
                                                    {filteredThreads.map(
                                                        (thread) => (
                                                            <Link
                                                                href={`/forum/${thread.id}`}
                                                                key={thread.id}
                                                                className="block"
                                                            >
                                                                <Card className="hover:bg-muted/50 transition-colors">
                                                                    <CardHeader className="p-4">
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <div className="flex items-start gap-4">
                                                                                <Avatar className="h-8 w-8">
                                                                                    <AvatarImage
                                                                                        src={
                                                                                            thread
                                                                                                .author
                                                                                                .avatar
                                                                                        }
                                                                                        alt={
                                                                                            thread
                                                                                                .author
                                                                                                .name
                                                                                        }
                                                                                    />
                                                                                    <AvatarFallback>
                                                                                        {
                                                                                            thread
                                                                                                .author
                                                                                                .initials
                                                                                        }
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="space-y-1">
                                                                                    <CardTitle className="text-lg font-semibold truncate-title">
                                                                                        {
                                                                                            thread.title
                                                                                        }
                                                                                    </CardTitle>
                                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                                        <span>
                                                                                            {
                                                                                                thread
                                                                                                    .author
                                                                                                    .name
                                                                                            }
                                                                                        </span>
                                                                                        <span>
                                                                                            •
                                                                                        </span>
                                                                                        <span>
                                                                                            {
                                                                                                thread.createdAt
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {thread.isNew && (
                                                                                    <Badge
                                                                                        variant="secondary"
                                                                                        className="bg-[#4bcefa] text-white px-2 py-0.5"
                                                                                    >
                                                                                        🌟
                                                                                        New
                                                                                    </Badge>
                                                                                )}
                                                                                {thread.isHot &&
                                                                                    thread.hotScore && (
                                                                                        <Badge
                                                                                            variant="secondary"
                                                                                            className={
                                                                                                thread.hotScore >
                                                                                                200
                                                                                                    ? "bg-[#ff5454] text-white px-3 py-0.5 rounded-full"
                                                                                                    : thread.hotScore >
                                                                                                        150
                                                                                                      ? "bg-[#ff5454] text-white px-3 py-0.5 rounded-full opacity-90"
                                                                                                      : "bg-[#ff5454] text-white px-3 py-0.5 rounded-full opacity-75"
                                                                                            }
                                                                                        >
                                                                                            🔥{" "}
                                                                                            {thread.hotScore >
                                                                                            200
                                                                                                ? "Super Hot"
                                                                                                : thread.hotScore >
                                                                                                    150
                                                                                                  ? "Very Hot"
                                                                                                  : "Hot"}
                                                                                        </Badge>
                                                                                    )}
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className={
                                                                                        thread.categoryColor
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        thread.category
                                                                                    }
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap break-words">
                                                                            {thread
                                                                                .content
                                                                                .length >
                                                                            126
                                                                                ? thread.content.slice(
                                                                                      0,
                                                                                      126
                                                                                  ) +
                                                                                  "..."
                                                                                : thread.content}
                                                                        </p>
                                                                    </CardHeader>
                                                                    <CardFooter className="p-4 pt-0">
                                                                        <div className="flex flex-col gap-4">
                                                                            <div className="flex items-center gap-4">
                                                                                {thread.tags.map(
                                                                                    (
                                                                                        tag
                                                                                    ) => (
                                                                                        <Badge
                                                                                            key={
                                                                                                tag
                                                                                            }
                                                                                            variant="outline"
                                                                                            className="text-xs font-normal"
                                                                                        >
                                                                                            {
                                                                                                tag
                                                                                            }
                                                                                        </Badge>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <MessageSquare className="h-4 w-4" />
                                                                                        <span>
                                                                                            {
                                                                                                thread.replies
                                                                                            }{" "}
                                                                                            replies
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <ThumbsUp className="h-4 w-4" />
                                                                                        <span>
                                                                                            {
                                                                                                thread.likes
                                                                                            }{" "}
                                                                                            likes
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Users className="h-4 w-4" />
                                                                                        <span>
                                                                                            {
                                                                                                thread.views
                                                                                            }{" "}
                                                                                            views
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </CardFooter>
                                                                </Card>
                                                            </Link>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10">
                                                    <p className="text-muted-foreground">
                                                        No discussions found
                                                        matching your search
                                                        criteria.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="lg:w-[300px] flex-none">
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Forum Categories
                                            </CardTitle>
                                            <CardDescription>
                                                Browse discussions by category
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-2">
                                            <Link
                                                href="/forum/categories/academics"
                                                className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Academics
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Discussions about
                                                        courses, professors, and
                                                        academic resources
                                                    </p>
                                                </div>
                                            </Link>
                                            <Link
                                                href="/forum/categories/career"
                                                className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
                                                    <TrendingUp className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Career
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Job hunting,
                                                        internships, interviews,
                                                        and career development
                                                    </p>
                                                </div>
                                            </Link>
                                            <Link
                                                href="/forum/categories/campus-life"
                                                className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400">
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Campus Life
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Housing, social
                                                        activities, and life at
                                                        Cornell Tech
                                                    </p>
                                                </div>
                                            </Link>
                                            <Link
                                                href="/forum/categories/technology"
                                                className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400">
                                                    <Tag className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Technology
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tech trends, tools,
                                                        programming, and
                                                        technical discussions
                                                    </p>
                                                </div>
                                            </Link>
                                            <Link
                                                href="/forum/categories/events"
                                                className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Events
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Campus events, meetups,
                                                        conferences, and
                                                        networking opportunities
                                                    </p>
                                                </div>
                                            </Link>
                                            <Link
                                                href="/forum/categories/general"
                                                className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400">
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">
                                                        General
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        General discussions and
                                                        topics that don't fit
                                                        elsewhere
                                                    </p>
                                                </div>
                                            </Link>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle>Forum Stats</CardTitle>
                                            <CardDescription>
                                                Community activity at a glance
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2 pb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Total Threads
                                                </span>
                                                <span className="font-medium">
                                                    {forumStats?.totalThreads}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Total Posts
                                                </span>
                                                <span className="font-medium">
                                                    {forumStats?.totalPosts}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    New Today
                                                </span>
                                                <span className="font-medium">
                                                    {forumStats?.newToday}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Top Contributors
                                            </CardTitle>
                                            <CardDescription>
                                                Most active community members
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {topContributors.map(
                                                (contributor) => (
                                                    <div
                                                        key={contributor.id}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <Avatar>
                                                            <AvatarImage
                                                                src={
                                                                    contributor.avatar_url ||
                                                                    "/placeholder.svg?height=40&width=40"
                                                                }
                                                                alt={`@${contributor.name}`}
                                                            />
                                                            <AvatarFallback>
                                                                {getInitials(
                                                                    contributor.name
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <p className="font-medium">
                                                                {
                                                                    contributor.name
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    contributor.post_count
                                                                }{" "}
                                                                posts
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                            {topContributors.length === 0 && (
                                                <div className="text-center text-sm text-muted-foreground">
                                                    No contributors yet
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-8 md:px-6">
                    {totalPages > 1 && (
                        <div className="w-full flex justify-center mb-8">
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
                                            onClick={() => setCurrentPage(page)}
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
                                            Math.min(totalPages, prev + 1)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    aria-label="Next page"
                                    className="w-10 h-10 p-0"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    aria-label="Last page"
                                    className="w-10 h-10 p-0"
                                >
                                    <ChevronsRight className="w-5 h-5" />
                                </Button>
                            </nav>
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Join the Conversation
                            </h2>
                            <p className="text-muted-foreground">
                                Have a question or something to share? Start a
                                new discussion thread.
                            </p>
                        </div>
                        <Link href="/forum/create">
                            <Button className="gap-1">
                                <PlusCircle className="h-4 w-4" />
                                <span>Create New Thread</span>
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

const styles = `
    @media (max-width: 900px) {
        .truncate-title {
            max-width: 15ch;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
`;

if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
