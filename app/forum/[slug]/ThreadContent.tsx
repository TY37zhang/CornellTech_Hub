"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BookmarkPlus,
  BookmarkCheck,
  MessageSquare,
  ThumbsUp,
  Edit,
  Trash2,
  Flag,
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
import { getRoleDisplayName } from "@/lib/roles";
import {
  createForumComment,
  getForumComments,
  toggleForumSave,
  checkUserSaveStatus,
} from "../actions";
import { LikeButton } from "@/app/components/LikeButton";
import NestedComment from "./components/NestedComment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import ReportModal from "@/components/ReportModal";

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

// Helper function to format nested comments for display
function formatNestedComments(comments: any[]): any[] {
  const formatComment = (comment: any): any => ({
    id: comment.id,
    content: comment.content,
    createdAt: formatDate(comment.created_at),
    like_count: comment.like_count || 0,
    dislike_count: comment.dislike_count || 0,
    depth: comment.depth || 0,
    isDeleted: comment.is_deleted || false,
    author: {
      id: comment.author_id,
      name: comment.author_name,
      avatar: comment.author_avatar || "/placeholder.svg?height=40&width=40",
      program: comment.author_role
        ? getRoleDisplayName(comment.author_role)
        : "Student",
      joinDate: formatDate(comment.created_at),
    },
    replies: comment.replies ? comment.replies.map(formatComment) : [],
  });

  return comments.map(formatComment);
}

// Helper function to remove a comment by ID from nested structure
function removeCommentById(comments: any[], commentId: string): any[] {
  return comments.reduce((acc: any[], comment) => {
    if (comment.id === commentId) {
      // Skip this comment (remove it)
      return acc;
    }

    // Keep the comment but check its replies
    const updatedComment = {
      ...comment,
      replies: comment.replies
        ? removeCommentById(comment.replies, commentId)
        : [],
    };

    return [...acc, updatedComment];
  }, []);
}

// Helper function to update a comment by ID in nested structure
function updateCommentById(
  comments: any[],
  commentId: string,
  newContent: string,
): any[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, content: newContent };
    }

    if (comment.replies) {
      return {
        ...comment,
        replies: updateCommentById(comment.replies, commentId, newContent),
      };
    }

    return comment;
  });
}

// Helper function to mark a comment as deleted by ID in nested structure
function markCommentAsDeletedById(comments: any[], commentId: string): any[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, isDeleted: true };
    }

    if (comment.replies) {
      return {
        ...comment,
        replies: markCommentAsDeletedById(comment.replies, commentId),
      };
    }

    return comment;
  });
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
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "most-liked":
        sortedComments.sort(
          (a, b) => (b.like_count || 0) - (a.like_count || 0),
        );
        break;
      case "most-disliked":
        sortedComments.sort(
          (a, b) => (b.dislike_count || 0) - (a.dislike_count || 0),
        );
        break;
    }

    return formatNestedComments(sortedComments);
  } catch (error) {
    console.error("Error sorting comments:", error);
    return [];
  }
}

// Add this new function at the top level
async function getRelatedThreads(postId: string, categorySlug: string) {
  try {
    const response = await fetch(
      `/api/forum/related?postId=${postId}&category=${categorySlug}`,
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
  const { data: session } = useSession();
  const router = useRouter();
  const [threadData, setThreadData] = useState(initialThreadData);
  const [comments, setComments] = useState(
    formatNestedComments(initialComments),
  );
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [sortedComments, setSortedComments] = useState(
    formatNestedComments(initialComments),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [relatedThreads, setRelatedThreads] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingPost, setReportingPost] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Add this useEffect to check initial save status
  useEffect(() => {
    const checkSaveStatus = async () => {
      if (session?.user?.id) {
        const saved = await checkUserSaveStatus(threadId, session.user.id);
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
        threadData.category.toLowerCase(),
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

        // Format the comments (they now come with nested structure)
        const formattedComments = formatNestedComments(updatedComments);

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
          variant: "success",
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

  // Handle sort change
  const handleSort = async (value: string) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Initial sort on component mount
  useEffect(() => {
    handleSort("recent");
  }, []);

  // Delete the post
  const handleDeletePost = async () => {
    if (!session?.user?.id) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/user/posts/${threadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        });
        // Redirect to forum after successful deletion
        router.push("/forum");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete post.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Handle edit post navigation
  const handleEditPost = () => {
    if (!session?.user?.id) {
      router.push("/auth/signin");
      return;
    }
    router.push(`/user/posts/${threadId}/edit`);
  };

  // Handle report post
  const handleReportPost = () => {
    setReportingPost({
      id: threadId,
      title: threadData.title,
    });
    setReportModalOpen(true);
  };

  // Modify the Reply Form section to show login prompt if not authenticated
  const replyForm = session?.user ? (
    <Card>
      <CardHeader>
        <CardTitle>Add a Reply</CardTitle>
        <CardDescription>Share your thoughts on this topic</CardDescription>
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
        <Button className="w-full" onClick={() => router.push("/auth/signin")}>
          Sign In to Reply
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full pt-24 pb-12 md:pb-16 lg:pb-12">
          <div className="mx-auto max-w-[980px] px-6 overflow-hidden">
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
                  <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {threadData.category}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl break-words">
                  {threadData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">
                    Posted by {threadData.author.name}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>{threadData.createdAt}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{threadData.stats.replies} replies</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{threadData.stats.likes} likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-6 overflow-hidden">
          <div className="mx-auto max-w-[980px] px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_300px] max-w-full">
              <div className="space-y-6 min-w-0 overflow-hidden">
                {/* Original Post */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={threadData.author.avatar || "/placeholder.svg"}
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
                            {threadData.author.program}
                            <span className="hidden sm:inline">
                              {" "}
                              • Joined {threadData.author.joinDate}
                            </span>
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
                        {threadData.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <LikeButton
                          postId={threadId}
                          initialLikeCount={threadData.stats.likes}
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
                          <span>{isSaved ? "Saved" : "Save"}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session?.user?.id === threadData.author.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleEditPost}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReportPost}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleReportPost}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>

                {/* Replies */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold tracking-tight">
                        {threadData.stats.replies}{" "}
                        {threadData.stats.replies === 1 ? "Reply" : "Replies"}
                      </h2>
                    </div>
                    <div className="flex-shrink-0">
                      <Select
                        value={sortBy}
                        onValueChange={handleSort}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-[140px] sm:w-[140px] w-full min-w-0">
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="most-liked">Most Liked</SelectItem>
                          <SelectItem value="most-disliked">
                            Most Disliked
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedComments.map((comment) => (
                        <NestedComment
                          key={comment.id}
                          comment={comment}
                          threadId={threadId}
                          originalPosterId={threadData.author.id}
                          onCommentDeleted={(commentId) => {
                            setSortedComments((prev) =>
                              removeCommentById(prev, commentId),
                            );
                            // Decrement reply count in thread stats
                            setThreadData((prev: any) => ({
                              ...prev,
                              stats: {
                                ...prev.stats,
                                replies: (prev.stats.replies || 1) - 1,
                              },
                            }));
                          }}
                          onCommentMarkedDeleted={(commentId) => {
                            setSortedComments((prev) =>
                              markCommentAsDeletedById(prev, commentId),
                            );
                            // Don't decrement reply count for soft deletion
                          }}
                          onCommentUpdated={(commentId, newContent) => {
                            setSortedComments((prev) =>
                              updateCommentById(prev, commentId, newContent),
                            );
                          }}
                          onReplyAdded={async () => {
                            // Refresh comments to get the latest data
                            const updatedComments =
                              await getForumComments(threadId);
                            const formattedComments =
                              formatNestedComments(updatedComments);
                            setSortedComments(formattedComments);
                            setComments(formattedComments);
                          }}
                        />
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
                          src={threadData.author.avatar || "/placeholder.svg"}
                          alt={threadData.author.name}
                        />
                        <AvatarFallback>
                          {threadData.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{threadData.author.name}</p>
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
                        <span>{threadData.author.joinDate}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Posts</span>
                        <span>{threadData.author.postCount}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Likes
                        </span>
                        <span>{threadData.author.totalLikes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Threads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Related Threads
                    </CardTitle>
                    <CardDescription>
                      Similar discussions you might find interesting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-4">
                      {relatedThreads.map((thread, index) => (
                        <div
                          key={thread.id}
                          className="group relative rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-1">
                                <div className="h-2 w-2 rounded-full bg-primary/60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/forum/${thread.id}`}
                                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                                >
                                  {thread.title}
                                </Link>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {thread.reply_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  {thread.like_count}
                                </span>
                              </div>
                              <span>{formatDate(thread.created_at)}</span>
                            </div>

                            {thread.author_name && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>by</span>
                                <span className="font-medium">
                                  {thread.author_name}
                                </span>
                                {thread.author_id === threadData.author.id && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1 py-0"
                                  >
                                    Same Author
                                  </Badge>
                                )}
                              </div>
                            )}

                            {thread.tags && thread.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {thread.tags.slice(0, 2).map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs px-1 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {thread.tags.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{thread.tags.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {relatedThreads.length === 0 && (
                        <div className="text-center py-6">
                          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No related threads found
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try exploring the category for similar discussions
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {relatedThreads.length > 0 && (
                    <CardFooter className="pt-0">
                      <Link
                        href={`/forum/categories/${threadData.category.toLowerCase()}`}
                        className="w-full"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Explore {threadData.category}
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
                      <p>• Be respectful and constructive in your responses</p>
                      <p>• Stay on topic and avoid unnecessary tangents</p>
                      <p>• Do not share personal or sensitive information</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Post Confirmation Modal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post?
              <br />
              This action cannot be undone.
              <br />
              All comments and likes will also be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Post Modal */}
      {reportingPost && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportingPost(null);
          }}
          reportedItemType="post"
          reportedItemId={reportingPost.id}
          reportedItemTitle={reportingPost.title}
        />
      )}
    </div>
  );
}
