import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const sql = neon(process.env.DATABASE_URL || "");
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse(
                JSON.stringify({ error: "Please sign in to submit feedback" }),
                { status: 401 }
            );
        }

        const body = await req.json();
        const { type, message } = body;

        // Store feedback in database
        const result = await sql`
            INSERT INTO feedback (
                user_id,
                type,
                message,
                created_at
            ) VALUES (
                ${session.user.id},
                ${type},
                ${message},
                NOW()
            )
            RETURNING id
        `;

        // Send email notification
        const emailSubject = type === "bug" ? "New Bug Report" : "New Feedback";
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a73e8;">${emailSubject}</h2>
                <p><strong>From:</strong> ${session.user.name} (${session.user.email})</p>
                <p><strong>Type:</strong> ${type === "bug" ? "Bug Report" : "General Feedback"}</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Feedback ID: ${result[0].id}</p>
                <p style="color: #666; font-size: 14px;">User ID: ${session.user.id}</p>
            </div>
        `;

        // Get admin email from environment variables
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            console.error("ADMIN_EMAIL not configured");
            return new NextResponse(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500 }
            );
        }

        await resend.emails.send({
            from: `Cornell Tech Hub <notifications@${process.env.EMAIL_DOMAIN || "onboarding@resend.dev"}>`,
            to: adminEmail,
            subject: emailSubject,
            html: emailContent,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in feedback submission:", error);
        return new NextResponse(
            JSON.stringify({
                error: "Failed to submit feedback",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500 }
        );
    }
}
