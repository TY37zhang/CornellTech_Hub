"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    BookmarkPlus,
    BookmarkCheck,
    Flag,
    MessageSquare,
    Share2,
    ThumbsDown,
    ThumbsUp,
    SortAsc,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    createForumComment,
    getForumComments,
    getForumPostById,
    toggleForumLike,
    checkUserLikeStatus,
    toggleForumSave,
    checkUserSaveStatus,
} from "../actions";
import { LikeButton } from "@/app/components/LikeButton";
import { CommentActions } from "@/app/components/CommentActions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ThreadContentProps {
    threadData: any;
    comments: any[];
    threadId: string;
}

// Helper function to format date
function formatDate(date: string | Date): string {
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

// Add this new function at the top level
async function getSortedComments(postId: string, sortBy: string) {
    try {
        const comments = await getForumComments(postId);
        let sortedComments = [...comments];

        switch (sortBy) {
            case "recent":
                sortedComments.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );
                break;
            case "most-liked":
                sortedComments.sort(
                    (a, b) => (b.like_count || 0) - (a.like_count || 0)
                );
                break;
            case "most-disliked":
                sortedComments.sort(
                    (a, b) => (b.dislike_count || 0) - (a.dislike_count || 0)
                );
                break;
        }

        return sortedComments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: formatDate(comment.created_at),
            like_count: comment.like_count || 0,
            dislike_count: comment.dislike_count || 0,
            author: {
                name: comment.author_name,
                avatar:
                    comment.author_avatar ||
                    "/placeholder.svg?height=40&width=40",
                program: "Student",
                joinDate: formatDate(comment.created_at),
            },
        }));
    } catch (error) {
        console.error("Error sorting comments:", error);
        return [];
    }
}

// Add this new function at the top level
async function getRelatedThreads(postId: string, categorySlug: string) {
    try {
        const response = await fetch(
            `/api/forum/related?postId=${postId}&category=${categorySlug}`
        );
        const data = await response.json();
        return data.posts;
    } catch (error) {
        console.error("Error fetching related threads:", error);
        return [];
    }
}

export default function ThreadContent({
    threadData: initialThreadData,
    comments: initialComments,
    threadId,
}: ThreadContentProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [threadData, setThreadData] = useState(initialThreadData);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [sortBy, setSortBy] = useState<string>("recent");
    const [sortedComments, setSortedComments] = useState(initialComments);
    const [isLoading, setIsLoading] = useState(false);
    const [relatedThreads, setRelatedThreads] = useState<any[]>([]);

    // Function to refresh thread data
    const refreshThreadData = useCallback(async () => {
        try {
            const response = await fetch(`/api/forum/posts/${threadId}`);
            const data = await response.json();
            if (data.success) {
                setThreadData(data.post);
            }
        } catch (error) {
            console.error("Error refreshing thread data:", error);
        }
    }, [threadId]);

    // Check initial like status
    useEffect(() => {
        async function checkLikeStatus() {
            if (session?.user?.id) {
                const { hasLiked: liked } = await checkUserLikeStatus(
                    threadId,
                    session.user.id
                );
                setHasLiked(liked);
            }
        }
        checkLikeStatus();
    }, [session?.user?.id, threadId]);

    // Add this useEffect to check initial save status
    useEffect(() => {
        const checkSaveStatus = async () => {
            if (session?.user?.id) {
                const saved = await checkUserSaveStatus(
                    threadId,
                    session.user.id
                );
                setIsSaved(saved);
            }
        };
        checkSaveStatus();
    }, [threadId, session?.user?.id]);

    // Fetch related threads on component mount
    useEffect(() => {
        async function fetchRelatedThreads() {
            const threads = await getRelatedThreads(
                threadId,
                threadData.category.toLowerCase()
            );
            setRelatedThreads(threads);
        }
        fetchRelatedThreads();
    }, [threadId, threadData.category]);

    // Track post view on mount
    useEffect(() => {
        if (!threadId) return;
        fetch("/api/forum/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: threadId }),
        });
    }, [threadId]);

    const handleAddComment = async () => {
        if (!session?.user) {
            // Redirect to login if not authenticated
            router.push("/auth/signin");
            return;
        }

        if (!newComment.trim()) {
            setCommentError("Comment cannot be empty");
            return;
        }

        try {
            setSubmitting(true);
            setCommentError(null);

            const result = await createForumComment({
                content: newComment,
                postId: threadId,
                authorId: session.user.id, // Use the authenticated user's ID
            });

            if (result.success) {
                // Clear the comment input
                setNewComment("");

                // Fetch updated comments
                const updatedComments = await getForumComments(threadId);

                // Format the comments
                const formattedComments = updatedComments.map((comment) => ({
                    id: comment.id,
                    content: comment.content,
                    createdAt: formatDate(comment.created_at),
                    like_count: comment.like_count || 0,
                    dislike_count: comment.dislike_count || 0,
                    author: {
                        name: comment.author_name,
                        avatar:
                            comment.author_avatar ||
                            "/placeholder.svg?height=40&width=40",
                        program: "Student",
                        joinDate: formatDate(comment.created_at),
                    },
                }));

                // Update the comments state
                setComments(formattedComments);
                setSortedComments(formattedComments);

                // Show success toast
                toast({
                    title: "Reply posted",
                    description: "Your reply has been added successfully.",
                });
            } else {
                setCommentError(result.error || "Failed to add comment");
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            setCommentError("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (!session?.user) {
            router.push("/auth/signin");
            return;
        }

        try {
            setIsLikeLoading(true);
            const result = await toggleForumLike(threadId, session.user.id);

            if (result.success) {
                // Update local state
                setHasLiked(result.action === "liked");
                // Refresh the entire thread data
                await refreshThreadData();
            }
        } catch (error) {
            console.error("Error updating like:", error);
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            // You could add a toast notification here
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    // Add this function to handle save/unsave
    const handleSave = async () => {
        if (!session?.user?.id) {
            toast({
                title: "Error",
                description: "You must be logged in to save threads",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await toggleForumSave(threadId, session.user.id);
            if (result.success) {
                setIsSaved(result.action === "saved");
                toast({
                    title: "Success",
                    description:
                        result.action === "saved"
                            ? "Thread saved successfully!"
                            : "Thread removed from saved items",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update save status",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            toast({
                title: "Error",
                description: "Failed to update save status",
                variant: "destructive",
            });
        }
    };

    const handleReport = () => {
        if (!session?.user) {
            router.push("/auth/signin");
            return;
        }
        // TODO: Implement report dialog/form
    };

    // Handle sort change
    const handleSort = async (value: string) => {
        try {
            setSortBy(value);
            const sorted = await getSortedComments(threadId, value);
            setSortedComments(sorted);
        } catch (error) {
            console.error("Error sorting comments:", error);
            toast({
                title: "Error",
                description: "Failed to sort comments. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Initial sort on component mount
    useEffect(() => {
        handleSort("recent");
    }, []);

    // Modify the Reply Form section to show login prompt if not authenticated
    const replyForm = session?.user ? (
        <Card>
            <CardHeader>
                <CardTitle>Add a Reply</CardTitle>
                <CardDescription>
                    Share your thoughts on this topic
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Write your reply here..."
                    className="min-h-[150px]"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                {commentError && (
                    <p className="text-sm text-red-500 mt-2">{commentError}</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleAddComment} disabled={submitting}>
                    {submitting ? "Posting..." : "Post"}
                </Button>
            </CardFooter>
        </Card>
    ) : (
        <Card>
            <CardHeader>
                <CardTitle>Join the Discussion</CardTitle>
                <CardDescription>
                    Sign in to share your thoughts on this topic
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => router.push("/auth/signin")}
                >
                    Sign In to Reply
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    asChild
                                    className="gap-2 text-muted-foreground"
                                >
                                    <Link href="/forum">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to forum
                                    </Link>
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400">
                                        {threadData.category}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    {threadData.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span>
                                        Posted by {threadData.author.name}
                                    </span>
                                    <span>•</span>
                                    <span>{threadData.createdAt}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>
                                            {threadData.stats.replies} replies
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>
                                            {threadData.stats.likes} likes
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                        <div className="space-y-6">
                            {/* Original Post */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={
                                                        threadData.author
                                                            .avatar ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={threadData.author.name}
                                                />
                                                <AvatarFallback>
                                                    {threadData.author.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-base">
                                                    {threadData.author.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {threadData.author.program}{" "}
                                                    • Joined{" "}
                                                    {threadData.author.joinDate}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {threadData.createdAt}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="space-y-4">
                                        <div className="whitespace-pre-line text-muted-foreground">
                                            {threadData.content}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {threadData.tags.map(
                                                (tag: string) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className="text-xs font-normal"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <LikeButton
                                                postId={threadId}
                                                initialLikeCount={
                                                    threadData.stats.likes
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`gap-1 ${isSaved ? "text-primary" : ""}`}
                                                onClick={handleSave}
                                            >
                                                {isSaved ? (
                                                    <BookmarkCheck className="h-4 w-4" />
                                                ) : (
                                                    <BookmarkPlus className="h-4 w-4" />
                                                )}
                                                <span>
                                                    {isSaved ? "Saved" : "Save"}
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* Replies */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold tracking-tight">
                                            {threadData.stats.replies}{" "}
                                            {threadData.stats.replies === 1
                                                ? "Reply"
                                                : "Replies"}
                                        </h2>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Select
                                            value={sortBy}
                                            onValueChange={handleSort}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Sort by..." />
                                            </SelectTrigger>
                                            <SelectContent align="end">
                                                <SelectItem value="recent">
                                                    Most Recent
                                                </SelectItem>
                                                <SelectItem value="most-liked">
                                                    Most Liked
                                                </SelectItem>
                                                <SelectItem value="most-disliked">
                                                    Most Disliked
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedComments.map((reply) => (
                                            <Card
                                                key={reply.id}
                                                className={
                                                    reply.isAccepted
                                                        ? "border-green-500 dark:border-green-700"
                                                        : ""
                                                }
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage
                                                                    src={
                                                                        reply
                                                                            .author
                                                                            .avatar ||
                                                                        "/placeholder.svg"
                                                                    }
                                                                    alt={
                                                                        reply
                                                                            .author
                                                                            .name
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {
                                                                        reply
                                                                            .author
                                                                            .name[0]
                                                                    }
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <CardTitle className="text-base">
                                                                    {
                                                                        reply
                                                                            .author
                                                                            .name
                                                                    }
                                                                </CardTitle>
                                                                <CardDescription>
                                                                    {
                                                                        reply
                                                                            .author
                                                                            .program
                                                                    }{" "}
                                                                    • Joined{" "}
                                                                    {
                                                                        reply
                                                                            .author
                                                                            .joinDate
                                                                    }
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {reply.isAccepted && (
                                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400">
                                                                    Best Answer
                                                                </Badge>
                                                            )}
                                                            <span className="text-sm text-muted-foreground">
                                                                {
                                                                    reply.createdAt
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pb-3">
                                                    <div className="whitespace-pre-line text-muted-foreground">
                                                        {reply.content}
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="flex items-center justify-between pt-1">
                                                    <div className="flex items-center gap-2">
                                                        <CommentActions
                                                            commentId={reply.id}
                                                            initialLikeCount={
                                                                reply.like_count ||
                                                                0
                                                            }
                                                            initialDislikeCount={
                                                                reply.dislike_count ||
                                                                0
                                                            }
                                                        />
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reply Form */}
                            {replyForm}
                        </div>

                        <div className="space-y-6">
                            {/* About the Author */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>About the Author</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage
                                                src={
                                                    threadData.author.avatar ||
                                                    "/placeholder.svg"
                                                }
                                                alt={threadData.author.name}
                                            />
                                            <AvatarFallback>
                                                {threadData.author.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {threadData.author.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {threadData.author.program}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Member Since
                                            </span>
                                            <span>
                                                {threadData.author.joinDate}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Posts
                                            </span>
                                            <span>
                                                {threadData.author.postCount}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Total Likes
                                            </span>
                                            <span>
                                                {threadData.author.totalLikes}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Related Threads */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Related Threads</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="space-y-4">
                                        {relatedThreads.map((thread) => (
                                            <div
                                                key={thread.id}
                                                className="space-y-1"
                                            >
                                                <Link
                                                    href={`/forum/${thread.id}`}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {thread.title}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {thread.reply_count} replies
                                                    •{" "}
                                                    {formatDate(
                                                        thread.created_at
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                        {relatedThreads.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                No related threads found
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                {relatedThreads.length > 0 && (
                                    <CardFooter>
                                        <Link
                                            href={`/forum/categories/${threadData.category.toLowerCase()}`}
                                            className="w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                View More
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                )}
                            </Card>

                            {/* Forum Guidelines */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Forum Guidelines</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>
                                            • Be respectful and constructive in
                                            your responses
                                        </p>
                                        <p>
                                            • Stay on topic and avoid
                                            unnecessary tangents
                                        </p>
                                        <p>
                                            • Do not share personal or sensitive
                                            information
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
