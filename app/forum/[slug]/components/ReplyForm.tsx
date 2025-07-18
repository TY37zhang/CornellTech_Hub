"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createForumComment } from "../../actions";

interface ReplyFormProps {
    threadId: string;
    parentId: string;
    onReplySubmitted: () => void;
    onCancel: () => void;
    placeholder?: string;
}

export default function ReplyForm({ 
    threadId, 
    parentId, 
    onReplySubmitted, 
    onCancel,
    placeholder = "Write your reply..." 
}: ReplyFormProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!session?.user) {
        return (
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                    You need to be signed in to reply.
                </p>
                <Button 
                    size="sm" 
                    onClick={() => router.push("/auth/signin")}
                >
                    Sign In to Reply
                </Button>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError("Reply cannot be empty");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const result = await createForumComment({
                content: content.trim(),
                postId: threadId,
                authorId: session.user.id,
                parentId: parentId,
            });

            if (result.success) {
                setContent("");
                onReplySubmitted();
                toast({
                    title: "Reply posted",
                    description: "Your reply has been added successfully.",
                });
            } else {
                setError(result.error || "Failed to post reply");
            }
        } catch (err) {
            console.error("Error posting reply:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-3 space-y-3 border-l-2 border-muted pl-4">
            <Textarea
                placeholder={placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
            />
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex gap-2">
                <Button 
                    size="sm" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                >
                    {isSubmitting ? "Posting..." : "Post Reply"}
                </Button>
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}