"use client";

import { memo } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ForumPost {
    id: string;
    title: string;
    reply_count: number;
}

interface ForumPreviewProps {
    forumPosts: ForumPost[];
    forumError: string | null;
}

function ForumPreview({ forumPosts, forumError }: ForumPreviewProps) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-red-600" />
                    Student Forum
                </CardTitle>
                <CardDescription>
                    Connect with peers and discuss academic topics
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-2">
                    {forumError ? (
                        <div className="text-red-500 text-sm">{forumError}</div>
                    ) : (
                        forumPosts.map((post) => (
                            <div
                                className="flex items-center justify-between"
                                key={post.id}
                            >
                                <Link
                                    href={`/forum/${post.id}`}
                                    className="font-medium hover:underline max-w-[70%] truncate"
                                    style={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "block",
                                    }}
                                >
                                    {post.title}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                    {post.reply_count} replies
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/forum">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
                    >
                        Join Discussions
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

export default memo(ForumPreview);