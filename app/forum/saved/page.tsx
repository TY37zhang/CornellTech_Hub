"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, BookmarkX, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getUserSavedPosts, toggleForumSave } from "../actions";
import { formatDate } from "@/lib/utils";

export default function SavedPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unsavingPosts, setUnsavingPosts] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    postId: string;
    postTitle: string;
  }>({ isOpen: false, postId: "", postTitle: "" });

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

  const showConfirmDialog = (
    postId: string,
    postTitle: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDialog({ isOpen: true, postId, postTitle });
  };

  const handleConfirmUnsave = async () => {
    const { postId } = confirmDialog;
    setConfirmDialog({ isOpen: false, postId: "", postTitle: "" });

    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to unsave posts.",
        variant: "destructive",
      });
      return;
    }

    // Optimistically remove the post from UI
    const originalPosts = [...savedPosts];
    setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
    setUnsavingPosts((prev) => new Set(prev).add(postId));

    try {
      const result = await toggleForumSave(postId, session.user.id);
      if (result.success && result.action === "unsaved") {
        toast({
          title: "Success",
          description: "Post removed from saved posts.",
        });
      } else {
        // Rollback on failure
        setSavedPosts(originalPosts);
        toast({
          title: "Error",
          description: result.error || "Failed to unsave post.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Rollback on error
      setSavedPosts(originalPosts);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUnsavingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full pt-24 pb-12 md:pb-16 lg:pb-12">
          <div className="mx-auto max-w-[980px] px-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl font-bold tracking-tight">Saved Posts</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Your bookmarked forum discussions
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-6">
          <div className="mx-auto max-w-[980px] px-6">
            <div className="space-y-6">
              {savedPosts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookmarkPlus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No saved posts yet
                    </h3>
                    <p className="text-muted-foreground text-center mb-4">
                      When you save a post, it will appear here for easy access
                      later.
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
                            <CardTitle>{post.title}</CardTitle>
                            <CardDescription>
                              Posted by {post.author_name} •{" "}
                              {formatDate(post.created_at)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {post.category_name}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) =>
                                showConfirmDialog(post.id, post.title, e)
                              }
                              disabled={unsavingPosts.has(post.id)}
                              className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600"
                              title="Remove from saved posts"
                            >
                              {unsavingPosts.has(post.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <BookmarkX className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>{post.reply_count} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{post.like_count} likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{post.view_count} views</span>
                        </div>
                        <div className="ml-auto text-xs">
                          Saved {formatDate(post.saved_at)}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog({ isOpen: open, postId: "", postTitle: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Saved Posts</DialogTitle>
            <div className="text-sm text-muted-foreground space-y-3">
              <div>
                Are you sure you want to remove this post from your saved posts?
              </div>
              <div className="p-3 bg-surface-hover rounded-lg border-l-4 border-red-500/20">
                <p className="font-medium text-t1 text-sm leading-relaxed">
                  {confirmDialog.postTitle}
                </p>
              </div>
              <div className="text-red-600 text-sm">
                This action cannot be undone.
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ isOpen: false, postId: "", postTitle: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmUnsave}
              disabled={unsavingPosts.has(confirmDialog.postId)}
            >
              {unsavingPosts.has(confirmDialog.postId) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
