"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { isFaculty, isStaff, getRoleDisplayName } from "@/lib/roles";

interface Reply {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    name: string;
    role: string;
    is_admin: boolean;
    is_mod: boolean;
  };
}

interface ReviewRepliesProps {
  reviewId: string;
  className?: string;
}

export default function ReviewReplies({
  reviewId,
  className = "",
}: ReviewRepliesProps) {
  const { data: session } = useSession();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Check if current user is faculty or staff
  const canReply =
    session?.user?.role &&
    (isFaculty(session.user.role) || isStaff(session.user.role));

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/courses/reviews/${reviewId}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies || []);
      } else {
        console.error("Failed to fetch replies");
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [reviewId]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/courses/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (response.ok) {
        const data = await response.json();
        setReplies([...replies, data.reply]);
        setReplyContent("");
        setShowReplyForm(false);
        toast.success("Reply posted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!editContent.trim()) {
      toast.error("Please enter content");
      return;
    }

    try {
      const response = await fetch(`/api/courses/reviews/replies/${replyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const data = await response.json();
        setReplies(
          replies.map((reply) => (reply.id === replyId ? data.reply : reply)),
        );
        setEditingReplyId(null);
        setEditContent("");
        toast.success("Reply updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update reply");
      }
    } catch (error) {
      console.error("Error updating reply:", error);
      toast.error("Failed to update reply");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/reviews/replies/${replyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReplies(replies.filter((reply) => reply.id !== replyId));
        toast.success("Reply deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete reply");
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Failed to delete reply");
    }
  };

  const startEdit = (reply: Reply) => {
    setEditingReplyId(reply.id);
    setEditContent(reply.content);
  };

  const cancelEdit = () => {
    setEditingReplyId(null);
    setEditContent("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    if (isFaculty(role)) {
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-400 border-blue-500/20"
        >
          Faculty
        </Badge>
      );
    }
    if (isStaff(role)) {
      return (
        <Badge
          variant="secondary"
          className="bg-green-500/10 text-green-400 border-green-500/20"
        >
          Staff
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading replies...</div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Replies List */}
      {replies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px bg-border flex-1" />
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-3">
              <MessageSquare className="h-4 w-4" />
              Faculty & Staff Responses ({replies.length})
            </h4>
            <div className="h-px bg-border flex-1" />
          </div>

          {replies.map((reply) => (
            <Card
              key={reply.id}
              className="bg-blue-500/10 border-blue-500/20 ml-4"
            >
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {reply.users.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{reply.users.name}</p>
                      {getRoleBadge(reply.users.role)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.created_at)}
                      {reply.updated_at !== reply.created_at && " (edited)"}
                    </span>

                    {session?.user?.id === reply.users.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(reply)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReply(reply.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {editingReplyId === reply.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Edit your reply..."
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditReply(reply.id)}
                        disabled={!editContent.trim()}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {reply.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {canReply && (
        <div className="space-y-4">
          {/* Separator before reply section */}
          {replies.length === 0 && (
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px bg-border flex-1" />
            </div>
          )}

          {!showReplyForm ? (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReplyForm(true)}
                className="text-blue-400 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors ml-4"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Reply as {isFaculty(session?.user?.role) ? "Faculty" : "Staff"}
              </Button>
            </div>
          ) : (
            <div className="ml-4">
              <Card className="border-blue-500/20 bg-blue-500/10">
                <CardContent className="px-6 py-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-400 pt-2 pb-0">
                      <MessageSquare className="h-4 w-4" />
                      Replying as{" "}
                      {isFaculty(session?.user?.role) ? "Faculty" : "Staff"}
                    </div>

                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your faculty response to this review... Share insights about the course, address concerns, or provide additional context to help students."
                      className="min-h-[120px] resize-none border-blue-500/20 focus:border-blue-400"
                    />

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent("");
                        }}
                        size="sm"
                        className="hover:bg-white/[0.04]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitReply}
                        disabled={submitting || !replyContent.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
