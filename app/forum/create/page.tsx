"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { createThread } from "../actions";
import { useToast } from "@/components/ui/use-toast";

export default function CreateThreadPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
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
            router.push("/auth/signin?callbackUrl=/forum/create");
        }
    }, [status, router]);

    // Show loading state while checking authentication
    if (status === "loading") {
        return <div>Loading...</div>;
    }

    // Don't render the form if not authenticated
    if (!session?.user) {
        router.push("/auth/signin");
        return;
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
                description: "You must be logged in to create a thread",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const result = await createThread({
                title: formData.title.trim(),
                content: formData.content.trim(),
                category: formData.category,
                tags: tags.map((tag) => tag.trim()),
                authorId: session.user.id,
                notifyOnReply: formData.notifyOnReply,
            });

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Thread created successfully!",
                });
                router.back();
            } else {
                toast({
                    title: "Error",
                    description:
                        result.error ||
                        "Failed to create thread. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to create thread. Please try again.",
                variant: "destructive",
            });
            console.error("Error creating thread:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/forum">
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="sr-only">
                                            Back to forum
                                        </span>
                                    </Link>
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Back to forum
                                </p>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center">
                                <h1 className="text-4xl font-bold tracking-tight">
                                    Create New Thread
                                </h1>
                                <p className="text-muted-foreground text-lg mt-2">
                                    Start a new discussion or ask a question to
                                    the Cornell Tech community
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <Card className="mx-auto max-w-2xl">
                        <form onSubmit={handleSubmit}>
                            <CardHeader className="text-center">
                                <CardTitle>New Discussion Thread</CardTitle>
                                <CardDescription>
                                    Please provide details about your discussion
                                    topic or question
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter a descriptive title for your thread"
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
                                            <SelectItem value="academics">
                                                Academics
                                            </SelectItem>
                                            <SelectItem value="career">
                                                Career
                                            </SelectItem>
                                            <SelectItem value="campus-life">
                                                Campus Life
                                            </SelectItem>
                                            <SelectItem value="technology">
                                                Technology
                                            </SelectItem>
                                            <SelectItem value="events">
                                                Events
                                            </SelectItem>
                                            <SelectItem value="general">
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
                                            your thread
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

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="notify"
                                            className="h-4 w-4"
                                            checked={formData.notifyOnReply}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    notifyOnReply:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="notify"
                                            className="text-sm font-normal"
                                        >
                                            Notify me when someone replies to
                                            this thread
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" asChild>
                                    <Link href="/forum">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading
                                        ? "Creating..."
                                        : "Create Thread"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </section>
            </div>
        </div>
    );
}
