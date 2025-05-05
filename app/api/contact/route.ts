import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return new NextResponse(
                JSON.stringify({ error: "All fields are required." }),
                { status: 400 }
            );
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.error("ADMIN_EMAIL not configured");
            return new NextResponse(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500 }
            );
        }

        const emailSubject = `Contact Form: ${subject}`;
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a73e8;">New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            </div>
        `;

        await resend.emails.send({
            from: `Cornell Tech Hub <notifications@${process.env.EMAIL_DOMAIN || "onboarding@resend.dev"}>`,
            to: adminEmail,
            subject: emailSubject,
            html: emailContent,
            reply_to: email,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in contact form submission:", error);
        return new NextResponse(
            JSON.stringify({
                error: "Failed to send message",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500 }
        );
    }
}
