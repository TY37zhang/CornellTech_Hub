import { sql } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendForumReplyNotification(
    postId: string,
    commentId: string,
    commentAuthorId: string
) {
    try {
        // Get post details and author info
        const postDetails = await sql`
            SELECT 
                fp.id,
                fp.title,
                fp.content,
                u.email as author_email,
                u.name as author_name,
                u2.name as comment_author_name
            FROM forum_posts fp
            JOIN users u ON fp.author_id = u.id
            JOIN forum_comments fc ON fc.id = ${commentId}
            JOIN users u2 ON fc.author_id = u2.id
            WHERE fp.id = ${postId}
        `;

        if (!postDetails || postDetails.length === 0) {
            console.error("Post not found for notification");
            return;
        }

        const post = postDetails[0];

        // Check if author wants notifications
        const notificationPreference = await sql`
            SELECT notify_on_reply
            FROM forum_notification_preferences
            WHERE post_id = ${postId}
            AND user_id = ${post.author_id}
        `;

        if (
            !notificationPreference ||
            !notificationPreference[0]?.notify_on_reply
        ) {
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
            to: post.author_email,
            subject: `New reply to your forum post: ${post.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a73e8;">New Reply to Your Forum Post</h2>
                    <p>Hello ${post.author_name},</p>
                    <p><strong>${post.comment_author_name}</strong> has replied to your forum post <strong>"${post.title}"</strong>.</p>
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
