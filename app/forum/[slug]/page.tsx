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
import { prisma } from "@/lib/db/prisma";
import ThreadContent from "./ThreadContent";
import { notFound } from "next/navigation";

// Helper function to format date
function formatDate(dateStr: string): string {
    const now = new Date();
    const postDate = new Date(dateStr);
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getThreadData(slug: string) {
    const post = await prisma.forum_posts.findUnique({
        where: { id: slug },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    avatar_url: true,
                },
            },
            forum_categories: {
                select: {
                    name: true,
                },
            },
            forum_post_tags: {
                select: {
                    tag: true,
                },
            },
            forum_likes: {
                select: { id: true },
            },
            forum_views: {
                select: { id: true },
            },
            forum_comments: {
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
                    comment_votes: {
                        select: {
                            action_type: true,
                        },
                    },
                },
            },
        },
    });
    if (!post) {
        return null;
    }

    // Format the thread data
    const threadData = {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.forum_categories.name,
        createdAt: formatDate(post.created_at),
        author: {
            id: post.users.id,
            name: post.users.name,
            avatar:
                post.users.avatar_url || "/placeholder.svg?height=40&width=40",
            program: "Student",
            joinDate: formatDate(post.created_at),
            postCount: await prisma.forum_posts.count({
                where: { author_id: post.users.id, status: "active" },
            }),
            totalLikes: await prisma.forum_likes.count({
                where: { forum_posts: { author_id: post.users.id } },
            }),
        },
        tags: post.forum_post_tags.map((tag) => tag.tag),
        stats: {
            replies: post.forum_comments.length,
            likes: post.forum_likes.length,
            views: post.forum_views.length,
        },
    };

    // Format the comments
    const formattedComments = post.forum_comments.map((comment) => {
        const likeCount = comment.comment_votes.filter(
            (v) => v.action_type === "upvote"
        ).length;
        const dislikeCount = comment.comment_votes.filter(
            (v) => v.action_type === "downvote"
        ).length;

        return {
            id: comment.id,
            content: comment.content,
            createdAt: formatDate(comment.created_at),
            like_count: likeCount,
            dislike_count: dislikeCount,
            author: {
                id: comment.users.id,
                name: comment.users.name,
                avatar:
                    comment.users.avatar_url ||
                    "/placeholder.svg?height=40&width=40",
                program: "Student",
                joinDate: formatDate(comment.created_at),
            },
        };
    });

    return {
        threadData,
        comments: formattedComments,
    };
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Helper to extract UUID from slug or return original if already UUID
function extractUUID(id: string): string {
    const match = id.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    return match ? match[0] : id;
}

export default async function ThreadPage({ params }: PageProps) {
    // Await the params object
    const resolvedParams = await params;

    // Validate params first
    if (!resolvedParams?.slug) {
        notFound();
    }

    // Extract UUID from slug
    const actualId = extractUUID(resolvedParams.slug);

    // Get the data
    const data = await getThreadData(actualId);
    if (!data) {
        notFound();
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ThreadContent
                threadData={data.threadData}
                comments={data.comments}
                threadId={actualId}
            />
        </Suspense>
    );
}
