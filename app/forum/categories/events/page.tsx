"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Calendar,
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

// Sample thread data for Events category
const eventsThreadsData: Thread[] = [
    {
        id: "hackathon-2024",
        title: "Cornell Tech Hackathon 2024 - Registration Open",
        author: {
            name: "Michael Chen",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U1",
        },
        category: "Events",
        categoryColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        content:
            "Registration for the annual Cornell Tech Hackathon is now open! This year's theme is 'Sustainable Technology'. The event will take place from April 12-14, 2024. Looking for team members or have questions about the event? Join the discussion here!",
        tags: ["hackathon", "sustainability", "team-formation"],
        replies: 42,
        likes: 35,
        views: 128,
        badge: {
            text: "Hot",
            color: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
        },
        createdAt: "3 days ago",
        isHot: true,
    },
    {
        id: "career-fair",
        title: "Spring Career Fair - Company List Released",
        author: {
            name: "Sarah Johnson",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U2",
        },
        category: "Events",
        categoryColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        content:
            "The list of companies attending the Spring Career Fair has been released! Over 50 companies will be present, including tech giants and startups. I've created a spreadsheet with company details and roles they're hiring for. Let's discuss strategies for making the most of this opportunity.",
        tags: ["career-fair", "networking", "job-search"],
        replies: 28,
        likes: 22,
        views: 95,
        createdAt: "5 days ago",
    },
    {
        id: "tech-talk-series",
        title: "Tech Talk Series: AI in Healthcare",
        author: {
            name: "David Kim",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U3",
        },
        category: "Events",
        categoryColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        content:
            "Join us for the next Tech Talk in our series, featuring Dr. Emily Rodriguez from Mount Sinai Hospital discussing 'AI Applications in Healthcare'. The talk will be followed by a networking session. Who's planning to attend? Let's coordinate and maybe grab coffee afterward!",
        tags: ["tech-talks", "ai", "healthcare", "networking"],
        replies: 15,
        likes: 12,
        views: 48,
        badge: {
            text: "New",
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
        },
        createdAt: "1 day ago",
        isNew: true,
    },
    {
        id: "startup-weekend",
        title: "Startup Weekend - Looking for Team Members",
        author: {
            name: "Lisa Patel",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U4",
        },
        category: "Events",
        categoryColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        content:
            "I'm participating in the upcoming Startup Weekend and looking for team members. I have a background in product management and UI/UX design. Looking for developers, business strategists, or anyone interested in building something innovative. Let's connect and discuss ideas!",
        tags: ["startup-weekend", "team-formation", "entrepreneurship"],
        replies: 18,
        likes: 14,
        views: 62,
        createdAt: "2 days ago",
    },
];

export default function EventsCategoryPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("activity");
    const [filteredThreads, setFilteredThreads] =
        useState<Thread[]>(eventsThreadsData);

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...eventsThreadsData];

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
                    // Sort by recency (in a real app, you would use actual timestamps)
                    return a.createdAt.includes("day") ? -1 : 1;
                case "newest":
                    // Sort by creation date (in a real app, you would use actual timestamps)
                    return a.createdAt.includes("day") ? -1 : 1;
                case "popular":
                    return b.likes - a.likes;
                case "replies":
                    return b.replies - a.replies;
                default:
                    return 0;
            }
        });

        setFilteredThreads(result);
    }, [searchQuery, sortBy]);

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
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
                                    Events Discussions
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                    Connect with fellow students about upcoming
                                    events, hackathons, career fairs, and
                                    networking opportunities.
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
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        value={sortBy}
                                        onValueChange={setSortBy}
                                    >
                                        <SelectTrigger className="h-8 w-[130px]">
                                            <SelectValue placeholder="Sort By" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activity">
                                                Recent Activity
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
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Discussions
                        </h2>
                        <Link href="/forum/create">
                            <Button className="gap-1">
                                <PlusCircle className="h-4 w-4" />
                                <span>New Thread</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-4">
                        {filteredThreads.length > 0 ? (
                            filteredThreads.map((thread) => (
                                <Link
                                    href={`/forum/${thread.id}`}
                                    key={thread.id}
                                    className="group"
                                >
                                    <Card className="transition-all hover:border-primary">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-xl group-hover:text-primary">
                                                        {thread.title}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarImage
                                                                src={
                                                                    thread
                                                                        .author
                                                                        .avatar ||
                                                                    "/placeholder.svg"
                                                                }
                                                                alt={`@${thread.author.name}`}
                                                            />
                                                            <AvatarFallback>
                                                                {
                                                                    thread
                                                                        .author
                                                                        .initials
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>
                                                            {thread.author.name}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {thread.createdAt}
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    className={
                                                        thread.categoryColor
                                                    }
                                                >
                                                    {thread.category}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <p className="line-clamp-2 text-muted-foreground">
                                                {thread.content}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-3">
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
                                        </CardContent>
                                        <CardFooter className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span>
                                                        {thread.replies} replies
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp className="h-4 w-4" />
                                                    <span>
                                                        {thread.likes} likes
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>
                                                        {thread.views} views
                                                    </span>
                                                </div>
                                            </div>
                                            {thread.badge && (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            thread.badge.color
                                                        }
                                                    >
                                                        {thread.badge.text}
                                                    </Badge>
                                                </div>
                                            )}
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
                                Have an event to share or looking for event
                                partners? Start a new discussion thread.
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
