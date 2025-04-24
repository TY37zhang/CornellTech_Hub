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

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (status === "authenticated") {
                try {
                    const response = await fetch(`/api/user/posts`);
                    if (response.ok) {
                        const data = await response.json();
                        setPosts(data);
                    }
                } catch (error) {
                    console.error("Error fetching user posts:", error);
                } finally {
                    setLoading(false);
                }
            } else if (status === "unauthenticated") {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [status]);

    if (status === "loading" || loading) {
        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">My Posts</h1>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
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
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">My Posts</h1>
                <p>Please sign in to view your posts.</p>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">My Posts</h1>

            {posts.length === 0 ? (
                <Card>
                    <CardContent className="py-10">
                        <p className="text-center text-muted-foreground">
                            You haven't created any posts yet.
                        </p>
                        <div className="mt-4 text-center">
                            <Link
                                href="/forum/create"
                                className="text-primary hover:underline"
                            >
                                Create your first post
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {posts.map((post) => (
                        <Card key={post.id}>
                            <CardHeader>
                                <Link href={`/forum/${post.slug}`}>
                                    <CardTitle className="hover:underline">
                                        {post.title}
                                    </CardTitle>
                                </Link>
                                <CardDescription>
                                    Posted{" "}
                                    {formatDistanceToNow(
                                        new Date(post.createdAt),
                                        { addSuffix: true }
                                    )}{" "}
                                    in {post.category}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="line-clamp-3">{post.content}</p>
                                <div className="mt-4">
                                    <Link
                                        href={`/forum/${post.slug}`}
                                        className="text-primary hover:underline"
                                    >
                                        Read more
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
