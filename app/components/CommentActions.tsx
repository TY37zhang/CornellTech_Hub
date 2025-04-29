"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleCommentLike } from "@/app/forum/actions";

interface CommentActionsProps {
    commentId: string;
    initialLikeCount: number;
    initialDislikeCount: number;
}

export function CommentActions({
    commentId,
    initialLikeCount = 0,
    initialDislikeCount = 0,
}: CommentActionsProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
    const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);

    // Check user's existing vote on mount
    useEffect(() => {
        async function checkVoteStatus() {
            if (session?.user?.id) {
                try {
                    const response = await fetch(
                        `/api/comments/${commentId}/vote-status?userId=${session.user.id}`
                    );
                    const data = await response.json();
                    if (data.success) {
                        setUserVote(data.voteType);
                    }
                } catch (error) {
                    console.error("Error checking vote status:", error);
                }
            }
        }
        checkVoteStatus();
    }, [commentId, session?.user?.id]);

    const handleVote = async (action: "upvote" | "downvote") => {
        if (!session?.user) {
            router.push("/auth/signin");
            return;
        }

        if (isLoading) return;

        try {
            setIsLoading(true);
            const result = await toggleCommentLike(
                commentId,
                session.user.id,
                action
            );

            if (result.success) {
                setLikeCount(result.likeCount);
                setDislikeCount(result.dislikeCount);

                // Update the user's vote state
                if (userVote === action) {
                    setUserVote(null); // User removed their vote
                } else if (userVote === null) {
                    setUserVote(action); // User added a new vote
                } else {
                    setUserVote(action); // User changed their vote
                }
            }
        } catch (error) {
            console.error("Error updating vote:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                className={`gap-1 ${
                    userVote === "upvote" ? "text-primary bg-primary/10" : ""
                }`}
                onClick={() => handleVote("upvote")}
                disabled={isLoading}
            >
                <ThumbsUp
                    className={`h-4 w-4 ${
                        userVote === "upvote" ? "fill-current" : ""
                    }`}
                />
                <span>{likeCount}</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`gap-1 ${
                    userVote === "downvote" ? "text-primary bg-primary/10" : ""
                }`}
                onClick={() => handleVote("downvote")}
                disabled={isLoading}
            >
                <ThumbsDown
                    className={`h-4 w-4 ${
                        userVote === "downvote" ? "fill-current" : ""
                    }`}
                />
                <span>{dislikeCount}</span>
            </Button>
        </div>
    );
}
