"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
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
import { getForumStats, getTopContributors } from "./actions";

// NOTE: We do not import getForumPosts; we hit the API route instead to stay RSC-safe.

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

function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
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

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

// Memoized hot score calculation to avoid recalculation
const calculateHotScore = (() => {
    const cache = new Map();
    return (thread: {
        likes: number;
        replies: number;
        views: number;
        createdAt: string;
    }): { isHot: boolean; score: number } => {
        const cacheKey = `${thread.likes}-${thread.replies}-${thread.views}-${thread.createdAt}`;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }
        
        const now = new Date();
        const threadDate = new Date(thread.createdAt);
        const hoursSinceCreation =
            (now.getTime() - threadDate.getTime()) / (1000 * 60 * 60);
        const weights = { likes: 1, replies: 1.5, views: 0.2, recency: 2 };
        const likeScore = thread.likes * weights.likes;
        const replyScore = thread.replies * weights.replies;
        const viewScore = thread.views * weights.views;
        const recencyBoost = Math.max(
            0,
            100 - (hoursSinceCreation / 24) * weights.recency
        );
        const totalScore = likeScore + replyScore + viewScore + recencyBoost;
        const threshold = 50 + (hoursSinceCreation / 24) * 10;
        const result = { isHot: totalScore > threshold, score: totalScore };
        
        cache.set(cacheKey, result);
        return result;
    };
})();

const getVisiblePages = (current: number, total: number): number[] => {
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    if (current <= 3) end = Math.min(5, total);
    else if (current >= total - 2) start = Math.max(1, total - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
};

interface ForumClientProps {
    initialPosts?: any[]; // raw posts from server API
    initialStats?: any;
    initialContributors?: any[];
    initialTotalPages?: number;
}

function ForumClient({
    initialPosts = [],
    initialStats = null,
    initialContributors = [],
    initialTotalPages = 1,
}: ForumClientProps) {
    // Memoized initial thread processing
    const initialThreads = useMemo(() => {
        if (initialPosts.length > 0) {
            return initialPosts
                .map((post: any) => {
                    if (!post || typeof post !== "object") return null;
                    const hotStatus = calculateHotScore({
                        likes: post.like_count || 0,
                        replies: post.reply_count || 0,
                        views: post.view_count || 0,
                        createdAt: post.created_at || new Date().toISOString(),
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
                        replies: typeof post.reply_count === 'number' ? post.reply_count : 0,
                        likes: typeof post.like_count === 'number' ? post.like_count : 0,
                        views: typeof post.view_count === 'number' ? post.view_count : 0,
                        createdAt: formatDate(
                            post.created_at || new Date().toISOString()
                        ),
                        isHot: hotStatus.isHot,
                        hotScore: hotStatus.score,
                        isNew:
                            new Date(post.created_at || Date.now()).getTime() >
                            Date.now() - 7 * 24 * 60 * 60 * 1000,
                    } as Thread;
                })
                .filter(Boolean) as Thread[];
        }
        return [];
    }, [initialPosts]);
    
    const [threads, setThreads] = useState<Thread[]>(initialThreads);
    const [forumStats, setForumStats] = useState<any>(initialStats);
    const [topContributors, setTopContributors] =
        useState<any[]>(initialContributors);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const threadsPerPage = 10;
    const [activeTab, setActiveTab] = useState("all");
    const [isMobile, setIsMobile] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const firstLoadRef = useRef(true);

    // Debounced search to reduce API calls
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Helper function to serialize errors to readable strings
    const serializeError = (error: unknown): string => {
        if (!error) return "An unknown error occurred";
        
        // Handle Error objects
        if (error instanceof Error) {
            return error.message || "An error occurred";
        }
        
        // Handle string errors
        if (typeof error === 'string') {
            return error;
        }
        
        // Handle objects with error property
        if (typeof error === 'object' && error !== null) {
            const errorObj = error as any;
            
            // Try common error properties
            if (typeof errorObj.message === 'string') {
                return errorObj.message;
            }
            
            if (typeof errorObj.error === 'string') {
                return errorObj.error;
            }
            
            // Handle rate limit error structure: { message: string, retryAfter: number }
            if (typeof errorObj.message === 'string' && typeof errorObj.retryAfter === 'number') {
                return `${errorObj.message} (retry in ${errorObj.retryAfter} seconds)`;
            }
            
            if (typeof errorObj.statusText === 'string') {
                return `HTTP Error: ${errorObj.statusText}`;
            }
            
            // Try to extract meaningful information from the object
            try {
                const jsonStr = JSON.stringify(errorObj);
                if (jsonStr !== '{}') {
                    return `Error: ${jsonStr}`;
                }
            } catch {
                // JSON.stringify failed, continue to fallback
            }
        }
        
        // Final fallback
        return "Failed to fetch data";
    };

    // Memoized fetch function
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const offset = (currentPage - 1) * threadsPerPage;
            const params = new URLSearchParams({
                search: debouncedSearchQuery,
                limit: threadsPerPage.toString(),
                offset: offset.toString(),
            });
            const res = await fetch(`/api/forum/posts?${params.toString()}`);
            if (!res.ok) {
                let errorData;
                try {
                    errorData = await res.json();
                } catch (parseError) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                const errorMessage = typeof errorData.error === 'string' 
                    ? errorData.error 
                    : serializeError(errorData.error) || `HTTP error! status: ${res.status}`;
                throw new Error(errorMessage);
            }
            const postsData = await res.json();
            const [stats, contributors] = await Promise.all([
                getForumStats(),
                getTopContributors(),
            ]);
            if (!postsData.success)
                throw new Error(postsData.error || "Failed to fetch posts");
            if (!Array.isArray(postsData.posts))
                throw new Error("Invalid response format");

            const formattedThreads: Thread[] = postsData.posts
                .map((post: any) => {
                    if (!post || typeof post !== "object") return null;
                    
                    // Ensure numeric values are properly typed
                    const likeCount = typeof post.like_count === 'number' ? post.like_count : 0;
                    const replyCount = typeof post.reply_count === 'number' ? post.reply_count : 0;
                    const viewCount = typeof post.view_count === 'number' ? post.view_count : 0;
                    
                    const hotStatus = calculateHotScore({
                        likes: likeCount,
                        replies: replyCount,
                        views: viewCount,
                        createdAt: post.created_at || new Date().toISOString(),
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
                        replies: replyCount,
                        likes: likeCount,
                        views: viewCount,
                        createdAt: formatDate(
                            post.created_at || new Date().toISOString()
                        ),
                        isHot: hotStatus.isHot,
                        hotScore: hotStatus.score,
                        isNew:
                            new Date(post.created_at || Date.now()).getTime() >
                            Date.now() - 7 * 24 * 60 * 60 * 1000,
                    } as Thread;
                })
                .filter(Boolean) as Thread[];
            setThreads(formattedThreads);
            setForumStats(stats);
            setTopContributors(contributors);
            setTotalPages(Math.ceil(postsData.total / threadsPerPage));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching forum data:", err);
            
            // Enhanced error logging for debugging
            if (err instanceof Error) {
                console.error("Error details:", {
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                });
            } else {
                console.error("Non-Error object caught:", {
                    type: typeof err,
                    value: err,
                    stringified: (() => {
                        try {
                            return JSON.stringify(err);
                        } catch {
                            return 'Unable to stringify error';
                        }
                    })()
                });
            }
            
            const errorMessage = serializeError(err);
            setError(errorMessage);
            setLoading(false);
        }
    }, [debouncedSearchQuery, currentPage, threadsPerPage]);

    useEffect(() => {
        // Skip fetching on the very first render when we already have server data
        if (firstLoadRef.current) {
            firstLoadRef.current = false;
            return;
        }
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 900);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Memoized filtering and sorting
    const filteredThreads = useMemo(() => {
        let result = [...threads];
        if (activeTab !== "all")
            result = result.filter((t) => t.category === activeTab);
        if (selectedCategory !== "all")
            result = result.filter(
                (t) => t.category.toLowerCase() === selectedCategory
            );
        result.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
        return result;
    }, [activeTab, selectedCategory, threads]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <div className="flex-1">
                    {/* HERO SKELETON */}
                    <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                        <div className="container px-4 md:px-6">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <div className="h-10 w-64 bg-muted rounded animate-pulse mx-auto" />
                                    <div className="h-6 w-96 bg-muted rounded animate-pulse mx-auto" />
                                </div>
                                <div className="w-full max-w-2xl">
                                    <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* MAIN SECTION SKELETON */}
                    <section className="w-full py-6">
                        <div className="container px-4 md:px-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* LEFT COLUMN SKELETON */}
                                <div className="flex-1">
                                    <div className="w-full">
                                        <div className="flex w-full items-center justify-between mb-6">
                                            <div className="h-10 w-64 bg-muted rounded animate-pulse" />
                                            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                                        </div>

                                        <div className="space-y-4">
                                            {[...Array(6)].map((_, i) => (
                                                <Card key={i} className="overflow-hidden">
                                                    <CardHeader className="p-4">
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                                                            <div className="flex flex-row items-start gap-2 sm:gap-4 w-full sm:w-auto">
                                                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-muted rounded-full animate-pulse" />
                                                                <div className="flex flex-col min-w-0 flex-1">
                                                                    <div className="h-6 w-full max-w-[280px] bg-muted rounded animate-pulse mb-2" />
                                                                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                                                                <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                                                            </div>
                                                        </div>
                                                        <div className="h-12 w-full bg-muted rounded animate-pulse mt-2" />
                                                    </CardHeader>
                                                    <CardFooter className="p-4 pt-0">
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <div className="flex gap-2">
                                                                <div className="h-5 w-12 bg-muted rounded animate-pulse" />
                                                                <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                                                                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                                                                <div className="h-4 w-18 bg-muted rounded animate-pulse" />
                                                            </div>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDEBAR SKELETON */}
                                <div className="lg:w-[300px] flex-none">
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <Card key={i}>
                                                <CardHeader>
                                                    <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
                                                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {[...Array(4)].map((_, j) => (
                                                        <div key={j} className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                                                            <div className="flex-1">
                                                                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1" />
                                                                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
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

    // --- inline style fix for mobile title truncation ---
    if (typeof document !== "undefined") {
        const id = "forum-title-style";
        if (!document.getElementById(id)) {
            const styleSheet = document.createElement("style");
            styleSheet.id = id;
            styleSheet.textContent = `@media (max-width: 900px){.truncate-title{max-width:15ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}}`;
            document.head.appendChild(styleSheet);
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                {/* HERO */}
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-mono tracking-tighter sm:text-3xl md:text-4xl">
                                    Student Forum
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground text-base md:text-lg font-mono">
                                    Connect, discuss, and share knowledge.
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

                {/* MAIN SECTION */}
                <section className="w-full py-6">
                    <div className="container px-4 md:px-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Discussions
                            </h2>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* LEFT COLUMN */}
                            <div className="flex-1">
                                <Tabs
                                    defaultValue="all"
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="w-full"
                                >
                                    <div className="flex w-full items-center justify-between">
                                        {isMobile ? (
                                            <div className="flex items-center">
                                                <Select
                                                    value={activeTab}
                                                    onValueChange={setActiveTab}
                                                >
                                                    <SelectTrigger className="w-[200px]">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            "all",
                                                            "Academics",
                                                            "Career",
                                                            "Campus Life",
                                                            "Technology",
                                                            "Events",
                                                            "General",
                                                        ].map((cat) => (
                                                            <SelectItem
                                                                key={cat}
                                                                value={cat}
                                                            >
                                                                {cat === "all"
                                                                    ? "All Discussions"
                                                                    : cat}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) : (
                                            <TabsList>
                                                {[
                                                    "all",
                                                    "Academics",
                                                    "Career",
                                                    "Campus Life",
                                                    "Technology",
                                                    "Events",
                                                    "General",
                                                ].map((cat) => (
                                                    <TabsTrigger
                                                        key={cat}
                                                        value={cat}
                                                    >
                                                        {cat === "all"
                                                            ? "All Discussions"
                                                            : cat}
                                                    </TabsTrigger>
                                                ))}
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
                                                <div className="grid gap-4 max-w-full">
                                                    {filteredThreads.map(
                                                        (thread) => (
                                                            <ForumThreadCard
                                                                key={thread.id}
                                                                thread={thread}
                                                            />
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

                            {/* RIGHT SIDEBAR */}
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
                                            {[
                                                [
                                                    "Academics",
                                                    "Discussions about courses, professors, and academic resources",
                                                    BookOpen,
                                                    "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400",
                                                ],
                                                [
                                                    "Career",
                                                    "Job hunting, internships, interviews, and career development",
                                                    TrendingUp,
                                                    "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400",
                                                ],
                                                [
                                                    "Campus Life",
                                                    "Housing, social activities, and life at Cornell Tech",
                                                    Users,
                                                    "bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400",
                                                ],
                                                [
                                                    "Technology",
                                                    "Tech trends, tools, programming, and technical discussions",
                                                    Tag,
                                                    "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400",
                                                ],
                                                [
                                                    "Events",
                                                    "Campus events, meetups, conferences, and networking opportunities",
                                                    MessageSquare,
                                                    "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
                                                ],
                                                [
                                                    "General",
                                                    "General discussions and topics that don't fit elsewhere",
                                                    MessageSquare,
                                                    "bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400",
                                                ],
                                            ].map(
                                                ([name, desc, Icon, color]) => (
                                                    <Link
                                                        href={`/forum/categories/${String(name).toLowerCase().replace(" ", "-")}`}
                                                        key={String(name)}
                                                        className="flex items-start gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors"
                                                    >
                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}
                                                        >
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">
                                                                {String(name)}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {String(desc)}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                )
                                            )}
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
                                            {[
                                                [
                                                    "Total Threads",
                                                    forumStats?.totalThreads,
                                                ],
                                                [
                                                    "Total Posts",
                                                    forumStats?.totalPosts,
                                                ],
                                                [
                                                    "New Today",
                                                    forumStats?.newToday,
                                                ],
                                            ].map(([label, val]) => (
                                                <div
                                                    key={label}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="text-sm text-muted-foreground">
                                                        {label}
                                                    </span>
                                                    <span className="font-medium">
                                                        {val}
                                                    </span>
                                                </div>
                                            ))}
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
                                            {topContributors.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center gap-3"
                                                >
                                                    <Avatar>
                                                        <AvatarImage
                                                            src={
                                                                c.avatar_url ||
                                                                "/placeholder.svg?height=40&width=40"
                                                            }
                                                            alt={`@${c.name}`}
                                                        />
                                                        <AvatarFallback>
                                                            {getInitials(
                                                                c.name
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium">
                                                            {c.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {c.post_count} posts
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
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

                {/* FOOTER CTA */}
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
                                    ).map((page) => (
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

// Memoized forum thread card component for better performance
const ForumThreadCard = memo(({ thread }: { thread: Thread }) => {
    return (
        <Link
            href={`/forum/${thread.id}`}
            className="block w-full"
        >
            <Card className="hover:bg-muted/50 transition-colors overflow-hidden">
                <CardHeader className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 flex-wrap">
                        <div className="flex flex-row sm:flex-row items-start gap-2 sm:gap-4 w-full sm:w-auto">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                <AvatarImage
                                    src={thread.author.avatar}
                                    alt={thread.author.name}
                                    loading="lazy"
                                />
                                <AvatarFallback>
                                    {thread.author.initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <CardTitle className="text-base sm:text-lg font-semibold truncate-title truncate max-w-[90vw] sm:max-w-[30ch]">
                                    {thread.title}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                    <span>{thread.author.name}</span>
                                    <span>•</span>
                                    <span>{thread.createdAt}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                            {thread.isNew && (
                                <Badge
                                    variant="new"
                                    className="px-2 py-0.5 text-xs sm:text-sm"
                                >
                                    🌟 New
                                </Badge>
                            )}
                            {thread.isHot && (
                                <Badge
                                    variant="hot"
                                    className="px-3 py-0.5 text-xs sm:text-sm"
                                >
                                    🔥{" "}
                                    {thread.hotScore > 200
                                        ? "Super Hot"
                                        : thread.hotScore > 150
                                        ? "Very Hot"
                                        : "Hot"}
                                </Badge>
                            )}
                            <Badge
                                variant={thread.category.toLowerCase() as any}
                                className="text-xs sm:text-sm"
                            >
                                {thread.category}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 whitespace-pre-wrap break-words line-clamp-2 sm:line-clamp-none">
                        {thread.content.length > 126
                            ? thread.content.slice(0, 126) + "..."
                            : thread.content}
                    </p>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                    <div className="flex flex-col gap-2 sm:gap-4 w-full">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-4">
                            {thread.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="tag"
                                    className="text-[10px] sm:text-xs font-normal"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{thread.replies} replies</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{thread.likes} likes</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{thread.views} views</span>
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
});

ForumThreadCard.displayName = 'ForumThreadCard';

export default memo(ForumClient);
