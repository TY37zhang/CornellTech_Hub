"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Briefcase,
    Filter,
    MessageSquare,
    PlusCircle,
    Search,
    Tag,
    ThumbsUp,
    TrendingUp,
    Users,
    ArrowLeft,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getForumPostsByCategory } from "../../actions";

// Helper function to get category color
function getCategoryColor(category: string): string {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400";
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

// Define thread type
interface Thread {
    id: string;
    title: string;
    author: {
        name: string;
        avatar: string;
        initials: string;
    };
    category:
        | "Academics"
        | "Career"
        | "Campus Life"
        | "Technology"
        | "Events"
        | "General";
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
    isHot?: boolean;
    isNew?: boolean;
}

export default function CareerCategoryPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("activity");
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch threads on component mount
    useEffect(() => {
        async function fetchThreads() {
            try {
                const { posts } = await getForumPostsByCategory("career");
                const formattedThreads: Thread[] = posts.map((post) => ({
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
                    isHot: post.like_count > 10 || post.reply_count > 20,
                    isNew:
                        new Date(post.created_at).getTime() >
                        Date.now() - 7 * 24 * 60 * 60 * 1000,
                }));
                setThreads(formattedThreads);
            } catch (error) {
                console.error("Error fetching threads:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchThreads();
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
    }, [searchQuery, sortBy, threads]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-lg">
                        Loading career discussions...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col space-y-4">
                            <div className="w-full">
                                <div className="flex items-center justify-start">
                                    <Link
                                        href="/forum"
                                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to forum</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center space-y-2 text-center">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Career Discussions
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                    Connect with fellow students about
                                    internships, job opportunities, and career
                                    development.
                                </p>
                            </div>
                            <div className="w-full max-w-2xl mx-auto space-y-2">
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

                <section className="container px-4 py-6 md:px-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Career Discussions
                        </h2>
                        <div className="flex items-center gap-4">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activity">
                                        Most Recent
                                    </SelectItem>
                                    <SelectItem value="newest">
                                        Newest
                                    </SelectItem>
                                    <SelectItem value="popular">
                                        Most Popular
                                    </SelectItem>
                                    <SelectItem value="replies">
                                        Most Replies
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Link href="/forum/create">
                                <Button className="gap-2">
                                    <PlusCircle className="h-4 w-4" />
                                    New Discussion
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredThreads.length > 0 ? (
                            filteredThreads.map((thread) => (
                                <Link
                                    href={`/forum/${thread.id}`}
                                    key={thread.id}
                                    className="group"
                                >
                                    <Card className="hover:bg-muted/50 transition-colors">
                                        <CardHeader className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={
                                                                thread.author
                                                                    .avatar
                                                            }
                                                            alt={
                                                                thread.author
                                                                    .name
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {
                                                                thread.author
                                                                    .initials
                                                            }
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-lg font-semibold">
                                                            {thread.title}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>
                                                                {
                                                                    thread
                                                                        .author
                                                                        .name
                                                                }
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {
                                                                    thread.createdAt
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        thread.categoryColor
                                                    }
                                                >
                                                    {thread.category}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {thread.content}
                                            </p>
                                        </CardHeader>
                                        <CardFooter className="p-4 pt-0">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    {thread.tags.map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="outline"
                                                            className="text-xs font-normal"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="h-4 w-4" />
                                                            <span>
                                                                {thread.replies}{" "}
                                                                replies
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <ThumbsUp className="h-4 w-4" />
                                                            <span>
                                                                {thread.likes}{" "}
                                                                likes
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>
                                                                {thread.views}{" "}
                                                                views
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {thread.isNew && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-yellow-100 text-yellow-800"
                                                        >
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">
                                    No discussions found matching your search
                                    criteria.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="container px-4 py-8 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Join the Conversation
                            </h2>
                            <p className="text-muted-foreground">
                                Have a question about careers or something to
                                share? Start a new discussion thread.
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
