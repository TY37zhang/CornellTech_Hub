"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Edit } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Helper function to get category color
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    Academics: "bg-red-500/10 text-red-400 border border-red-500/20",
    Career: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    "Campus Life":
      "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    Technology: "bg-green-500/10 text-green-400 border border-green-500/20",
    Events: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    General: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  };
  return colors[category] || colors.General;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  category: string;
  slug: string;
  replyCount: number;
  likeCount: number;
  viewCount: number;
  tags: string[];
}

export default function UserPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (status === "authenticated") {
      try {
        const response = await fetch(`/api/user/posts`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch posts";
        console.error("Error fetching user posts:", error);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view your posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [status, session?.user?.email]);

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/user/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      // Remove the post from the local state
      setPosts(posts.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete post";
      toast.error(message);
    } finally {
      setPostToDelete(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <section className="w-full pt-24 pb-12 md:pb-16 lg:pb-12">
            <div className="mx-auto max-w-[980px] px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-bold tracking-tight">My Posts</h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Please sign in to view your posts
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-[980px] px-6 py-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center mb-4">
                  You need to be signed in to view your posts.
                </p>
                <Button asChild>
                  <a href="/auth/signin">Sign In</a>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <section className="w-full pt-24 pb-12 md:pb-16 lg:pb-12">
            <div className="mx-auto max-w-[980px] px-6">
              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-bold tracking-tight">My Posts</h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Error loading your posts
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-[980px] px-6 py-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-red-500 text-center mb-4">{error}</p>
                <Button onClick={fetchPosts}>Try Again</Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full pt-24 pb-12 md:pb-16 lg:pb-12">
          <div className="mx-auto max-w-[980px] px-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl font-bold tracking-tight">My Posts</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Your forum discussions and contributions
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[980px] px-6 py-6">
          <div className="flex justify-end mb-6">
            <Button asChild>
              <a href="/forum/create">Create Post</a>
            </Button>
          </div>

          <div className="space-y-6">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't created any forum posts yet.
                  </p>
                  <Button asChild>
                    <a href="/forum/create">Create your first post</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-shadow relative group"
                >
                  <Link href={`/forum/${post.id}`} className="block">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>
                            Posted {formatDate(post.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getCategoryColor(post.category)}
                          >
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Link>
                  <CardFooter className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-0">
                    <span>{post.replyCount} replies</span>
                    <span>{post.likeCount} likes</span>
                    <span>{post.viewCount} views</span>

                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/user/posts/${post.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPostToDelete(post.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      <AlertDialog
        open={!!postToDelete}
        onOpenChange={() => setPostToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && handleDelete(postToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
