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
import { neon } from "@neondatabase/serverless";
import { getForumPostById, getForumComments } from "../actions";
import ThreadContent from "./ThreadContent";
import { notFound } from "next/navigation";
import { getThreadData } from "./actions";

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
    const post = await getForumPostById(slug);
    if (!post) {
        return null;
    }

    const comments = await getForumComments(slug);

    // Format the thread data
    const threadData = {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category_name,
        createdAt: formatDate(post.created_at),
        author: {
            name: post.author_name,
            avatar: post.author_avatar || "/placeholder.svg?height=40&width=40",
            program: "Student",
            joinDate: formatDate(post.created_at),
            postCount: post.author_post_count || 0,
            totalLikes: post.author_total_likes || 0,
        },
        tags: post.tags || [],
        stats: {
            replies: comments.length,
            likes: post.like_count || 0,
            views: post.view_count || 0,
        },
    };

    // Format the comments
    const formattedComments = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: formatDate(comment.created_at),
        like_count: comment.like_count || 0,
        dislike_count: comment.dislike_count || 0,
        author: {
            name: comment.author_name,
            avatar:
                comment.author_avatar || "/placeholder.svg?height=40&width=40",
            program: "Student",
            joinDate: formatDate(comment.created_at),
        },
    }));

    return {
        threadData,
        comments: formattedComments,
    };
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ThreadPage({ params }: PageProps) {
    // Await the params object
    const resolvedParams = await params;

    // Validate params first
    if (!resolvedParams?.slug) {
        notFound();
    }

    // Get the data
    const data = await getThreadData(resolvedParams.slug);
    if (!data) {
        notFound();
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ThreadContent
                threadData={data.threadData}
                comments={data.comments}
                threadId={resolvedParams.slug}
            />
        </Suspense>
    );
}
