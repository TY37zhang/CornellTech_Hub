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

// Sample thread data for Academics category
const academicsThreadsData: Thread[] = [
    {
        id: "ml-resources",
        title: "Best resources for Machine Learning course",
        author: {
            name: "Sarah Chen",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U4",
        },
        category: "Academics",
        categoryColor:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        content:
            "I'm taking the Machine Learning course this semester and looking for supplementary resources. The textbook is good but I'm looking for more practical tutorials and examples. Has anyone found good YouTube channels, online courses, or GitHub repositories that complement the class material?",
        tags: ["machine-learning", "course-resources", "study-materials"],
        replies: 18,
        likes: 15,
        views: 47,
        createdAt: "5 days ago",
    },
    {
        id: "startup-ideas",
        title: "Startup ideas for Product Studio",
        author: {
            name: "David Kim",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U3",
        },
        category: "Academics",
        categoryColor:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        content:
            "I'm brainstorming potential startup ideas for Product Studio this fall. Looking for feedback on a few concepts I've been developing, and also curious to hear what areas others are exploring. Anyone interested in forming a team around fintech or healthcare innovations?",
        tags: ["product-studio", "startups", "team-formation"],
        replies: 12,
        likes: 9,
        views: 31,
        badge: {
            text: "New",
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
        },
        createdAt: "3 days ago",
        isNew: true,
    },
    {
        id: "data-science-project",
        title: "Looking for teammates for Data Science project",
        author: {
            name: "Emily Rodriguez",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U6",
        },
        category: "Academics",
        categoryColor:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        content:
            "I'm working on a data science project for the Applied Data Science class and looking for 2-3 teammates. The project will focus on analyzing public health data. I have experience with Python and pandas, but would love to collaborate with someone who knows visualization libraries like D3.js or Tableau.",
        tags: ["data-science", "team-formation", "projects"],
        replies: 8,
        likes: 5,
        views: 24,
        createdAt: "1 week ago",
    },
    {
        id: "cs-lecture-notes",
        title: "Sharing CS lecture notes and study materials",
        author: {
            name: "Michael Chang",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "U7",
        },
        category: "Academics",
        categoryColor:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400",
        content:
            "I've been taking detailed notes for the CS courses this semester and would be happy to share them with anyone who missed class or needs a refresher. I'm also looking to form a study group for the upcoming midterms. Anyone interested in collaborating?",
        tags: ["study-group", "notes", "collaboration"],
        replies: 15,
        likes: 22,
        views: 56,
        badge: {
            text: "Hot",
            color: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
        },
        createdAt: "2 days ago",
        isHot: true,
    },
];

export default function AcademicsCategoryPage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("activity");
    const [filteredThreads, setFilteredThreads] =
        useState<Thread[]>(academicsThreadsData);

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...academicsThreadsData];

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
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
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
                                    Academics Discussions
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                    Connect with fellow Cornell Tech students
                                    about courses, professors, and academic
                                    resources.
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
                        <Button className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span>New Thread</span>
                        </Button>
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
                                Have a question about academics or something to
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
