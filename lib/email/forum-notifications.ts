import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendForumReplyNotification(
    postId: string,
    commentId: string,
    commentAuthorId: string
) {
    try {
        // Get post details and author info
        const post = await db.ForumPost.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!post) {
            console.error("Post not found for notification");
            return;
        }

        const comment = await db.ForumComment.findUnique({
            where: { id: commentId },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!comment) {
            console.error("Comment not found for notification");
            return;
        }

        // Check if author wants notifications
        const notificationPreference =
            await db.ForumNotificationPreference.findUnique({
                where: {
                    post_id_user_id: {
                        post_id: postId,
                        user_id: post.author_id,
                    },
                },
            });

        if (!notificationPreference?.notify_on_reply) {
            return; // Author doesn't want notifications
        }

        // Get the app URL from environment variables or use a default
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://cornell-tech-hub.vercel.app";
        const postUrl = `${appUrl}/forum/${postId}`;

        // Send email notification
        await resend.emails.send({
            from: "Cornell Tech Hub <onboarding@resend.dev>", // Use your verified domain in production
            to: post.author.email,
            subject: `New reply to your forum post: ${post.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a73e8;">New Reply to Your Forum Post</h2>
                    <p>Hello ${post.author.name},</p>
                    <p><strong>${comment.author.name}</strong> has replied to your forum post <strong>"${post.title}"</strong>.</p>
                    <div style="margin: 25px 0;">
                        <a href="${postUrl}" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Reply</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">You're receiving this email because you enabled notifications for replies to this post. You can manage your notification preferences on the forum.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending forum reply notification:", error);
    }
}
