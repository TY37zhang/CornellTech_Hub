"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Code,
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

// Sample thread data for Technology category
const technologyThreadsData: Thread[] = [
    {
        id: "ai-tools",
        title: "Best AI Tools for Research and Development",
        author: {
            name: "Alex Patel",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U1",
        },
        category: "Technology",
        categoryColor:
            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        content:
            "I'm exploring various AI tools for my research project. Looking for recommendations on tools for data analysis, model training, and visualization. What AI platforms or libraries have you found most useful for academic research?",
        tags: ["ai", "machine-learning", "research-tools"],
        replies: 28,
        likes: 22,
        views: 95,
        badge: {
            text: "Hot",
            color: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
        },
        createdAt: "2 days ago",
        isHot: true,
    },
    {
        id: "web-dev-frameworks",
        title: "Web Development Frameworks Comparison",
        author: {
            name: "Rachel Wong",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U2",
        },
        category: "Technology",
        categoryColor:
            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        content:
            "I'm starting a new web project and trying to decide between Next.js, React, and Vue. What are the pros and cons of each framework? I'm particularly interested in performance, developer experience, and community support.",
        tags: ["web-development", "frameworks", "frontend"],
        replies: 19,
        likes: 15,
        views: 78,
        createdAt: "5 days ago",
    },
    {
        id: "blockchain-project",
        title: "Blockchain Project Collaboration",
        author: {
            name: "James Wilson",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U5",
        },
        category: "Technology",
        categoryColor:
            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        content:
            "I'm working on a blockchain-based supply chain tracking system and looking for collaborators. The project uses Solidity and React. Anyone interested in joining the team? Experience with smart contracts is a plus but not required.",
        tags: ["blockchain", "solidity", "collaboration"],
        replies: 12,
        likes: 8,
        views: 45,
        badge: {
            text: "New",
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
        },
        createdAt: "1 day ago",
        isNew: true,
    },
    {
        id: "cloud-services",
        title: "Cloud Services for Student Projects",
        author: {
            name: "Sophia Martinez",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U8",
        },
        category: "Technology",
        categoryColor:
            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        content:
            "What cloud services do you recommend for student projects? I'm looking for options with generous free tiers or student discounts. Currently considering AWS, Google Cloud, and Azure. Any tips on getting started with these platforms?",
        tags: ["cloud-computing", "aws", "student-resources"],
        replies: 15,
        likes: 10,
        views: 62,
        createdAt: "3 days ago",
    },
];

export default function TechnologyCategoryPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("activity");
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>(
        technologyThreadsData
    );

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...technologyThreadsData];

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
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
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
                                    Technology Discussions
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                    Connect with fellow students about
                                    programming, AI, web development,
                                    blockchain, and other tech topics.
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
                                Have a question about technology or something to
                                share? Start a new discussion thread.
                            </p>
                        </div>
                        <Button className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span>Create New Thread</span>
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
