"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookmarkPlus } from "lucide-react";
import Link from "next/link";

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
import { getUserSavedPosts } from "../actions";
import { formatDate } from "@/lib/utils";

export default function SavedPostsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            if (status === "loading") return;

            if (!session?.user?.id) {
                router.push("/auth/signin");
                return;
            }

            try {
                const posts = await getUserSavedPosts(session.user.id);
                setSavedPosts(posts);
            } catch (error) {
                console.error("Error fetching saved posts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSavedPosts();
    }, [session, status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center text-center">
                            <h1 className="text-4xl font-bold tracking-tight">
                                Saved Posts
                            </h1>
                            <p className="text-muted-foreground text-lg mt-2">
                                Your bookmarked forum discussions
                            </p>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <div className="space-y-6">
                        {savedPosts.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <BookmarkPlus className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">
                                        No saved posts yet
                                    </h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        When you save a post, it will appear
                                        here for easy access later.
                                    </p>
                                    <Button asChild>
                                        <a href="/forum">Browse Forum</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            savedPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/forum/${post.id}`}
                                    className="block"
                                >
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle>
                                                        {post.title}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Posted by{" "}
                                                        {post.author_name} •{" "}
                                                        {formatDate(
                                                            post.created_at
                                                        )}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline">
                                                    {post.category_name}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground line-clamp-2">
                                                {post.content}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {post.tags.map(
                                                    (tag: string) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <span>
                                                    {post.reply_count} replies
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>
                                                    {post.like_count} likes
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>
                                                    {post.view_count} views
                                                </span>
                                            </div>
                                            <div className="ml-auto text-xs">
                                                Saved{" "}
                                                {formatDate(post.saved_at)}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
