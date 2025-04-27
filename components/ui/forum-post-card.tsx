"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "./animated-card";
import {
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { ForumPostListSkeleton } from "./loading-skeleton";

interface ForumPost {
    id: number;
    title: string;
    author: string;
    date: string;
    replies: number;
    content?: string;
}

interface ForumPostCardProps {
    post: ForumPost;
    index?: number;
}

export function ForumPostCard({ post, index = 0 }: ForumPostCardProps) {
    const [isReplying, setIsReplying] = React.useState(false);
    const [replyText, setReplyText] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    const handleReply = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setReplyText("");
        setIsReplying(false);
        setIsLoading(false);
    };

    return (
        <AnimatedCard
            className="h-full"
            delay={index * 0.1}
            scale={1.02}
            y={-5}
            duration={0.3}
        >
            <CardHeader>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                >
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription>
                        Posted by {post.author} • {post.date}
                    </CardDescription>
                </motion.div>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                >
                    <p className="text-muted-foreground">
                        {post.content ||
                            "This is a sample forum post content. Click to read more..."}
                    </p>
                </motion.div>

                {isReplying && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 space-y-4"
                    >
                        <Textarea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[100px] focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsReplying(false)}
                                className="transition-all duration-200 hover:bg-muted"
                            >
                                Cancel
                            </Button>
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <Button
                                    onClick={handleReply}
                                    disabled={isLoading || !replyText.trim()}
                                    className="transition-all duration-200"
                                >
                                    {isLoading ? "Posting..." : "Post Reply"}
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
                    className="flex items-center gap-2"
                >
                    <span className="text-sm text-muted-foreground">
                        {post.replies} replies
                    </span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
                >
                    <Button variant="outline" size="sm">
                        View Discussion
                    </Button>
                </motion.div>
            </CardFooter>
        </AnimatedCard>
    );
}

export function ForumPostList({ posts }: { posts: ForumPost[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
                <ForumPostCard key={post.id} post={post} index={index} />
            ))}
        </div>
    );
}
