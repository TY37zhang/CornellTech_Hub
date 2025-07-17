"use client";

import type React from "react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPost, setIsLoadingPost] = useState(true);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "",
        notifyOnReply: false,
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/user/posts");
        }
    }, [status, router]);

    // Fetch post data for editing
    useEffect(() => {
        const fetchPost = async () => {
            if (status === "authenticated" && session?.user?.id) {
                try {
                    const response = await fetch(`/api/user/posts/${id}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch post");
                    }
                    const post = await response.json();
                    
                    // Pre-populate form with existing data
                    setFormData({
                        title: post.title || "",
                        content: post.content || "",
                        category: post.category || "",
                        notifyOnReply: false,
                    });
                    
                    // Set tags if they exist
                    if (post.tags && Array.isArray(post.tags)) {
                        setTags(post.tags);
                    }
                } catch (error) {
                    console.error("Error fetching post:", error);
                    toast({
                        title: "Error",
                        description: "Failed to load post data",
                        variant: "destructive",
                    });
                    router.push("/user/posts");
                } finally {
                    setIsLoadingPost(false);
                }
            }
        };

        fetchPost();
    }, [status, session, id, router, toast]);

    // Show loading state while checking authentication
    if (status === "loading" || isLoadingPost) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Don't render the form if not authenticated
    if (!session?.user) {
        return null;
    }

    const addTag = () => {
        // Only allow single word tags with no special characters
        const cleanTag = tagInput.trim().replace(/[^a-zA-Z0-9]/g, "");
        if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
            setTags([...tags, cleanTag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            // Only allow single word tags with no special characters
            const cleanTag = tagInput.trim().replace(/[^a-zA-Z0-9]/g, "");
            if (cleanTag) {
                addTag();
            } else {
                toast({
                    title: "Invalid Tag",
                    description:
                        "Tags must be single words with no special characters",
                    variant: "destructive",
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate title length
        if (formData.title.trim().length < 4) {
            toast({
                title: "Error",
                description: "Title must be at least 4 characters long",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        // Validate category is selected
        if (!formData.category) {
            toast({
                title: "Error",
                description: "Please select a category",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        // Validate content length
        if (formData.content.trim().length < 20) {
            toast({
                title: "Error",
                description: "Content must be at least 20 characters long",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (!session?.user?.id) {
            toast({
                title: "Error",
                description: "You must be logged in to edit a post",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/user/posts/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    content: formData.content.trim(),
                    category: formData.category,
                    tags: tags.map((tag) => tag.trim()),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update post");
            }

            toast({
                title: "Success",
                description: "Post updated successfully!",
            });
            router.push("/user/posts");
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update post. Please try again.",
                variant: "destructive",
            });
            console.error("Error updating post:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="container px-4 py-6 md:px-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/user/posts">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">
                                    Back to my posts
                                </span>
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Back to my posts
                        </p>
                    </div>
                    <Card className="mx-auto max-w-2xl">
                        <form onSubmit={handleSubmit}>
                            <CardHeader className="text-center">
                                <CardTitle>Edit Your Post</CardTitle>
                                <CardDescription>
                                    Update the details of your forum post
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter a descriptive title for your post"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                title: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Title must be at least 4 characters
                                        long. Be specific and imagine you're
                                        asking a question to another person.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value: string) =>
                                            setFormData({
                                                ...formData,
                                                category: value,
                                            })
                                        }
                                        required
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Academics">
                                                Academics
                                            </SelectItem>
                                            <SelectItem value="Career">
                                                Career
                                            </SelectItem>
                                            <SelectItem value="Campus Life">
                                                Campus Life
                                            </SelectItem>
                                            <SelectItem value="Technology">
                                                Technology
                                            </SelectItem>
                                            <SelectItem value="Events">
                                                Events
                                            </SelectItem>
                                            <SelectItem value="General">
                                                General
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Describe your question or discussion topic in detail..."
                                        className="min-h-[200px]"
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                content: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Content must be at least 20 characters
                                        long. Include all the information
                                        someone would need to answer your
                                        question.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="tags"
                                            placeholder="Add up to 5 tags (press Enter or comma to add)"
                                            value={tagInput}
                                            onChange={(e) => {
                                                // Only allow letters and numbers in the input
                                                const value =
                                                    e.target.value.replace(
                                                        /[^a-zA-Z0-9]/g,
                                                        ""
                                                    );
                                                setTagInput(value);
                                            }}
                                            onKeyDown={handleKeyDown}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addTag}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Add up to 5 tags to help categorize
                                            your post
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                                Note:
                                            </span>{" "}
                                            Tags must be single words containing
                                            only letters and numbers (A-Z, a-z,
                                            0-9). Special characters and spaces
                                            are not allowed.
                                        </p>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="flex items-center gap-1"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                                                        onClick={() =>
                                                            removeTag(tag)
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" asChild>
                                    <Link href="/user/posts">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading
                                        ? "Updating..."
                                        : "Update Post"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </section>
            </div>
        </div>
    );
}