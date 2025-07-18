"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { CommentActions } from "@/app/components/CommentActions";
import { updateForumComment } from "../../actions";
import { toast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import ReplyForm from "./ReplyForm";

interface NestedCommentProps {
    comment: {
        id: string;
        content: string;
        createdAt: string;
        like_count: number;
        dislike_count: number;
        depth: number;
        isDeleted?: boolean;
        author: {
            id: string;
            name: string;
            avatar: string;
            program: string;
            joinDate: string;
        };
        replies?: NestedCommentProps["comment"][];
    };
    threadId: string;
    onCommentDeleted: (commentId: string) => void;
    onCommentMarkedDeleted: (commentId: string) => void;
    onCommentUpdated: (commentId: string, newContent: string) => void;
    onReplyAdded: () => void;
    maxDepth?: number;
}

export default function NestedComment({
    comment,
    threadId,
    onCommentDeleted,
    onCommentMarkedDeleted,
    onCommentUpdated,
    onReplyAdded,
    maxDepth = 5,
}: NestedCommentProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const canReply = comment.depth < maxDepth;
    const isAuthor = session?.user?.id === comment.author?.id;
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleDelete = async () => {
        if (!session?.user?.id) {
            router.push("/auth/signin");
            return;
        }

        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: session.user.id }),
            });

            const data = await response.json();

            if (data.success) {
                // If comment has replies, mark as deleted to preserve thread structure
                if (hasReplies) {
                    onCommentMarkedDeleted(comment.id);
                } else {
                    // If no replies, remove completely
                    onCommentDeleted(comment.id);
                }
                toast({ title: "Comment deleted" });

                // Refresh comments after deletion to handle cascading cleanup
                onReplyAdded();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete comment.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast({
                title: "Error",
                description: "Failed to delete comment.",
                variant: "destructive",
            });
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(comment.content);
    };

    const handleSaveEdit = async () => {
        if (!session?.user?.id || !editContent.trim()) {
            return;
        }

        try {
            setIsUpdating(true);

            const result = await updateForumComment({
                commentId: comment.id,
                content: editContent.trim(),
                authorId: session.user.id,
            });

            if (result.success) {
                onCommentUpdated(comment.id, editContent.trim());
                setIsEditing(false);
                toast({
                    title: "Comment updated",
                    description: "Your comment has been updated successfully.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update comment.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating comment:", error);
            toast({
                title: "Error",
                description: "Failed to update comment.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const handleReplySubmitted = () => {
        setShowReplyForm(false);
        onReplyAdded();
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const indentationLevel = Math.min(comment.depth, 3); // Max visual indentation
    const marginLeft = indentationLevel * 8; // 8px per level for very compact spacing

    return (
        <div
            className={`relative group`}
            style={{ marginLeft: `${marginLeft}px` }}
        >
            {/* Elegant gradient threading line with collapse button */}
            {comment.depth > 0 && (
                <div
                    className="absolute top-0 bottom-0 w-0.5 transition-all duration-300 ease-out group-hover:w-1"
                    style={{
                        left: `-${marginLeft - 4}px`,
                        background: `linear-gradient(to bottom, 
                            ${
                                comment.depth === 1
                                    ? "hsl(220, 70%, 60%)"
                                    : comment.depth === 2
                                      ? "hsl(280, 60%, 55%)"
                                      : "hsl(340, 65%, 50%)"
                            } 0%, 
                            ${
                                comment.depth === 1
                                    ? "hsl(220, 50%, 40%)"
                                    : comment.depth === 2
                                      ? "hsl(280, 40%, 35%)"
                                      : "hsl(340, 45%, 30%)"
                            } 100%)`,
                        borderRadius: "2px",
                        opacity: 0.6,
                    }}
                />
            )}

            {/* Collapse button on indentation line */}
            {hasReplies && comment.depth > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className="absolute top-4 h-4 w-4 p-0 bg-transparent border-0 hover:bg-accent/20 z-10 transition-all duration-200"
                    style={{
                        left: `-${marginLeft - 4}px`,
                        transform: "translateX(-50%)",
                    }}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                    ) : (
                        <ChevronDown className="h-3 w-3" />
                    )}
                </Button>
            )}

            <Card
                className={`transition-all hover:shadow-sm group-hover:shadow-md`}
            >
                <CardHeader className="pb-1">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar
                                className={`${comment.depth > 0 ? "h-7 w-7" : "h-8 w-8"}`}
                            >
                                <AvatarImage
                                    src={
                                        comment.isDeleted
                                            ? "/placeholder.svg"
                                            : comment.author?.avatar ||
                                              "/placeholder.svg"
                                    }
                                    alt={
                                        comment.isDeleted
                                            ? "Deleted User"
                                            : comment.author?.name || "Unknown"
                                    }
                                />
                                <AvatarFallback className="text-xs">
                                    {comment.isDeleted
                                        ? "?"
                                        : comment.author?.name?.[0] || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-sm font-medium">
                                    {comment.isDeleted ? (
                                        <span className="text-muted-foreground">
                                            [Deleted User]
                                        </span>
                                    ) : (
                                        comment.author?.name || "Unknown User"
                                    )}
                                    {hasReplies && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({comment.replies?.length || 0}{" "}
                                            {(comment.replies?.length || 0) ===
                                            1
                                                ? "reply"
                                                : "replies"}
                                            {isCollapsed ? " - collapsed" : ""})
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground/80">
                                    {comment.isDeleted ? (
                                        "Comment was deleted"
                                    ) : (
                                        <>
                                            {comment.author?.program ||
                                                "Student"}{" "}
                                            • {comment.createdAt}
                                        </>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pb-0">
                    {comment.isDeleted ? (
                        <div className="ml-11 text-sm text-muted-foreground/60 italic leading-relaxed">
                            This comment has been deleted
                        </div>
                    ) : isEditing ? (
                        <div className="ml-11 space-y-3">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[80px]"
                                placeholder="Edit your comment..."
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={isUpdating || !editContent.trim()}
                                >
                                    {isUpdating ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="ml-11 whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                            {comment.content}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-0 pt-0 pb-1 pr-6">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                            {/* Collapse button for root level comments inside the card */}
                            {hasReplies && comment.depth === 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleCollapse}
                                    className="h-6 w-6 p-0 rounded-full bg-background border shadow-sm hover:bg-accent transition-all duration-200 mr-2"
                                >
                                    {isCollapsed ? (
                                        <ChevronRight className="h-3 w-3" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3" />
                                    )}
                                </Button>
                            )}
                            {!comment.isDeleted && (
                                <div
                                    className="flex items-center gap-1"
                                    style={{
                                        marginLeft:
                                            hasReplies && comment.depth === 0
                                                ? "0"
                                                : "2.75rem",
                                    }}
                                >
                                    <CommentActions
                                        commentId={comment.id}
                                        initialLikeCount={
                                            comment.like_count || 0
                                        }
                                        initialDislikeCount={
                                            comment.dislike_count || 0
                                        }
                                    />
                                    {canReply && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-muted-foreground hover:text-foreground h-8 px-1"
                                            onClick={() =>
                                                setShowReplyForm(!showReplyForm)
                                            }
                                            disabled={isEditing}
                                        >
                                            <Reply className="h-4 w-4" />
                                            <span>Reply</span>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {isAuthor && !comment.isDeleted && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleEdit}
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    disabled={isEditing}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            disabled={isEditing}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete comment
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                                This will permanently remove
                                                your comment and all replies to
                                                it from the thread.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={handleDelete}
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>

            {/* Reply Form */}
            {showReplyForm && !comment.isDeleted && (
                <ReplyForm
                    threadId={threadId}
                    parentId={comment.id}
                    onReplySubmitted={handleReplySubmitted}
                    onCancel={() => setShowReplyForm(false)}
                    placeholder={`Reply to ${comment.author?.name || "comment"}...`}
                />
            )}

            {/* Nested Replies */}
            {hasReplies && !isCollapsed && (
                <div className="space-y-3 mt-3">
                    {comment.replies?.map((reply) => (
                        <NestedComment
                            key={reply.id}
                            comment={reply}
                            threadId={threadId}
                            onCommentDeleted={onCommentDeleted}
                            onCommentMarkedDeleted={onCommentMarkedDeleted}
                            onCommentUpdated={onCommentUpdated}
                            onReplyAdded={onReplyAdded}
                            maxDepth={maxDepth}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
