import { Suspense } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BookmarkPlus,
    Flag,
    MessageSquare,
    Share2,
    ThumbsDown,
    ThumbsUp,
    SortAsc,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    getForumPostById,
    getForumComments,
    createForumComment,
} from "../actions";
import ThreadContent from "./ThreadContent";

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

export default async function ThreadPage({
    params,
}: {
    params: { slug: string };
}) {
    // Since this is now a server component, we can await the data directly
    const post = await getForumPostById(params.slug);
    const threadComments = await getForumComments(params.slug);

    if (!post) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Error</h2>
                    <p className="text-muted-foreground">Thread not found</p>
                    <Button className="mt-4" asChild>
                        <Link href="/forum">Back to Forum</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Format the thread data
    const threadData = {
        id: post.id,
        title: post.title,
        category: post.category_name,
        author: {
            name: post.author_name,
            avatar: post.author_avatar || "/placeholder.svg?height=40&width=40",
            program: "Student",
            joinDate: formatDate(post.created_at),
        },
        createdAt: formatDate(post.created_at),
        content: post.content,
        tags: post.tags,
        stats: {
            replies: post.reply_count,
            likes: post.like_count,
            views: post.view_count,
        },
    };

    // Format the comments
    const formattedComments = threadComments.map((comment) => ({
        id: comment.id,
        author: {
            name: comment.author_name,
            avatar:
                comment.author_avatar || "/placeholder.svg?height=40&width=40",
            program: "Student",
            joinDate: formatDate(comment.created_at),
        },
        createdAt: formatDate(comment.created_at),
        content: comment.content,
        likes: comment.like_count,
        isAccepted: false,
    }));

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-lg">Loading thread...</p>
                    </div>
                </div>
            }
        >
            <ThreadContent
                threadData={threadData}
                comments={formattedComments}
                threadId={params.slug}
            />
        </Suspense>
    );
}
