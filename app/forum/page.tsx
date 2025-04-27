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

export default function ForumPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("activity");
    const [activeTab, setActiveTab] = useState("all");
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [forumStats, setForumStats] = useState({
        totalThreads: 0,
        totalPosts: 0,
        activeUsers: 0,
        newToday: 0,
    });
    const [topContributors, setTopContributors] = useState<
        Array<{
            id: string;
            name: string;
            avatar_url: string | null;
            post_count: number;
        }>
    >([]);
    const [isMobile, setIsMobile] = useState(false);

    // Fetch threads, stats, and top contributors on component mount
    useEffect(() => {
        async function fetchData() {
            try {
                const [posts, stats, contributors] = await Promise.all([
                    getForumPosts(),
                    getForumStats(),
                    getTopContributors(),
                ]);

                const formattedThreads: Thread[] = posts.map((post) => {
                    const hotStatus = calculateHotScore({
                        likes: post.like_count,
                        replies: post.reply_count,
                        views: post.view_count,
                        createdAt: post.created_at,
                    });

                    return {
                        id: post.id,
                        title: post.title,
                        author: {
                            name: post.author_name,
                            avatar:
                                post.author_avatar ||
                                "/placeholder.svg?height=32&width=32",
                            initials: getInitials(post.author_name),
                        },
                        category: post.category_name,
                        categoryColor: getCategoryColor(post.category_name),
                        content: post.content,
                        tags: post.tags,
                        replies: post.reply_count,
                        likes: post.like_count,
                        views: post.view_count,
                        createdAt: formatDate(post.created_at),
                        isHot: hotStatus.isHot,
                        hotScore: hotStatus.score,
                        isNew:
                            new Date(post.created_at).getTime() >
                            Date.now() - 7 * 24 * 60 * 60 * 1000,
                    };
                });

                setThreads(formattedThreads);
                setForumStats(stats);
                setTopContributors(contributors);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

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

    // Filtered and sorted threads
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...threads];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (thread) =>
                    thread.title.toLowerCase().includes(query) ||
                    thread.content.toLowerCase().includes(query) ||
                    thread.author.name.toLowerCase().includes(query) ||
                    thread.tags.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Apply tab filter
        if (activeTab !== "all") {
            result = result.filter((thread) => thread.category === activeTab);
        }

        // Apply category filter
        if (categoryFilter !== "all") {
            result = result.filter(
                (thread) => thread.category.toLowerCase() === categoryFilter
            );
        }

        // Apply time filter
        if (timeFilter !== "all") {
            const now = new Date();
            result = result.filter((thread) => {
                const postDate = new Date(thread.createdAt);
                const diffTime = Math.abs(now.getTime() - postDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (timeFilter) {
                    case "day":
                        return diffDays <= 1;
                    case "week":
                        return diffDays <= 7;
                    case "month":
                        return diffDays <= 30;
                    case "year":
                        return diffDays <= 365;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "activity":
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                case "newest":
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                case "popular":
                    return b.likes - a.likes;
                case "replies":
                    return b.replies - a.replies;
                default:
                    return 0;
            }
        });

        setFilteredThreads(result);
    }, [searchQuery, categoryFilter, timeFilter, sortBy, activeTab, threads]);

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
                                                filteredThreads.map(
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
                                                )
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
                                                    {forumStats.totalThreads}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Total Posts
                                                </span>
                                                <span className="font-medium">
                                                    {forumStats.totalPosts}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    New Today
                                                </span>
                                                <span className="font-medium">
                                                    {forumStats.newToday}
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
