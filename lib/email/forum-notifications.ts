import { prisma } from "@/lib/db/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendForumReplyNotification(
    postId: string,
    commentId: string,
    commentAuthorId: string
) {
    try {
        // Get post details and author info
        const post = await prisma.forum_posts.findUnique({
            where: { id: postId },
            select: {
                id: true,
                title: true,
                author_id: true,
                users: { select: { email: true, name: true } },
            },
        });

        if (!post) {
            console.error("Post not found for notification:", postId);
            return;
        }

        console.log("Found post for notification:", {
            postId,
            authorId: post.author_id,
            title: post.title,
        });

        const comment = await prisma.forum_comments.findUnique({
            where: { id: commentId },
            select: {
                id: true,
                users: { select: { name: true } },
            },
        });

        if (!comment) {
            console.error("Comment not found for notification:", commentId);
            return;
        }

        // Check if author wants notifications
        const notificationPref =
            await prisma.forum_notification_preferences.findFirst({
                where: { post_id: postId, user_id: post.author_id },
                select: { notify_on_reply: true },
            });

        if (!notificationPref?.notify_on_reply) {
            console.log(
                "No notification preference found or notifications disabled for post:",
                postId,
                "user:",
                post.author_id,
                "notification preference:",
                notificationPref
            );
            return; // Author doesn't want notifications
        }

        console.log(
            "Sending notification email for post:",
            postId,
            "to:",
            post.users.email
        );

        // Get the app URL from environment variables or use a default
        const appUrl =
            process.env.APP_URL || "https://cornell-tech-hub.vercel.app";
        const postUrl = `${appUrl}/forum/${postId}`;

        // Send email notification
        await resend.emails.send({
            from: `Cornell Tech Hub <notifications@${process.env.EMAIL_DOMAIN || "cornelltechhub@resend.dev"}>`,
            to: post.users.email,
            subject: `New reply to your forum post: ${post.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a73e8;">New Reply to Your Forum Post</h2>
                    <p>Hello ${post.users.name},</p>
                    <p><strong>${comment.users.name}</strong> has replied to your forum post <strong>"${post.title}"</strong>.</p>
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
