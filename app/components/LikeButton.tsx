"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleForumLike, checkUserLikeStatus } from "@/app/forum/actions";

interface LikeButtonProps {
    postId: string;
    initialLikeCount: number;
}

export function LikeButton({ postId, initialLikeCount }: LikeButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    useEffect(() => {
        async function checkLikeStatus() {
            if (session?.user?.id) {
                const { hasLiked: liked } = await checkUserLikeStatus(
                    postId,
                    session.user.id
                );
                setHasLiked(liked);
            }
        }
        checkLikeStatus();
    }, [session?.user?.id, postId]);

    const handleLike = async () => {
        if (!session?.user) {
            router.push("/auth/signin");
            return;
        }

        try {
            setIsLikeLoading(true);
            const result = await toggleForumLike(postId, session.user.id);

            if (result.success) {
                setHasLiked(result.action === "liked");
                setLikeCount(result.newCount);
            }
        } catch (error) {
            console.error("Error updating like:", error);
        } finally {
            setIsLikeLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${hasLiked ? "text-primary bg-primary/10" : ""}`}
            onClick={handleLike}
            disabled={isLikeLoading}
        >
            <ThumbsUp
                className={`h-4 w-4 ${hasLiked ? "fill-current" : ""} ${isLikeLoading ? "animate-pulse" : ""}`}
            />
            <span>{likeCount}</span>
        </Button>
    );
}
