"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    category: string;
    slug: string;
}

export default function UserPostsPage() {
    const { data: session, status } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    const fetchPosts = async () => {
        if (status === "authenticated") {
            try {
                const response = await fetch(`/api/user/posts`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch posts");
                }
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch posts";
                console.error("Error fetching user posts:", error);
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        } else if (status === "unauthenticated") {
            setLoading(false);
            setError("Please sign in to view your posts");
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [status, session?.user?.email]);

    const handleDelete = async (postId: string) => {
        try {
            const response = await fetch(`/api/user/posts/${postId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete post");
            }

            // Remove the post from the local state
            setPosts(posts.filter((post) => post.id !== postId));
            toast.success("Post deleted successfully");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete post";
            toast.error(message);
        } finally {
            setPostToDelete(null);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="container max-w-4xl py-10 space-y-8">
                <h1 className="text-4xl font-bold">My Posts</h1>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader>
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="container max-w-4xl py-10 space-y-8">
                <h1 className="text-4xl font-bold">My Posts</h1>
                <Card>
                    <CardContent className="py-10">
                        <p className="text-center text-muted-foreground">
                            Please sign in to view your posts.
                        </p>
                        <div className="mt-4 text-center">
                            <Link
                                href="/auth/signin"
                                className="text-primary hover:underline font-medium"
                            >
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-4xl py-10 space-y-8">
                <h1 className="text-4xl font-bold">My Posts</h1>
                <Card>
                    <CardContent className="py-10">
                        <p className="text-center text-red-500">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold">My Posts</h1>
                <Link
                    href="/forum/create"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Create Post
                </Link>
            </div>

            {posts.length === 0 ? (
                <Card>
                    <CardContent className="py-10">
                        <p className="text-center text-muted-foreground">
                            You haven't created any posts yet.
                        </p>
                        <div className="mt-4 text-center">
                            <Link
                                href="/forum/create"
                                className="text-primary hover:underline font-medium"
                            >
                                Create your first post
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {posts.map((post) => (
                        <Card
                            key={post.id}
                            className="overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <Link
                                        href={`/forum/${post.slug}`}
                                        className="flex-1"
                                    >
                                        <CardTitle className="text-2xl hover:text-primary transition-colors break-words">
                                            {post.title}
                                        </CardTitle>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => setPostToDelete(post.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                                    <span>
                                        Posted{" "}
                                        {formatDistanceToNow(
                                            new Date(post.createdAt),
                                            { addSuffix: true }
                                        )}
                                    </span>
                                    <span>•</span>
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        {post.category}
                                    </Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground line-clamp-2 break-words whitespace-pre-wrap">
                                    {post.content}
                                </p>
                                <div>
                                    <Link
                                        href={`/forum/${post.slug}`}
                                        className="text-primary hover:underline font-medium inline-flex items-center gap-2"
                                    >
                                        Read more
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-4 h-4"
                                        >
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog
                open={!!postToDelete}
                onOpenChange={() => setPostToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                postToDelete && handleDelete(postToDelete)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
