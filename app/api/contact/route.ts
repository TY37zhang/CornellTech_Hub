import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sanitizeContent, escapeHTML } from "@/lib/sanitization";

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

        // Sanitize all input fields
        const nameSanitization = sanitizeContent(name.trim(), 'text');
        const subjectSanitization = sanitizeContent(subject.trim(), 'text');
        const messageSanitization = sanitizeContent(message.trim(), 'text');

        // Check for policy violations
        if (!nameSanitization.isValid) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "Name contains inappropriate content",
                    violations: nameSanitization.violations
                }),
                { status: 400 }
            );
        }

        if (!subjectSanitization.isValid) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "Subject contains inappropriate content",
                    violations: subjectSanitization.violations
                }),
                { status: 400 }
            );
        }

        if (!messageSanitization.isValid) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "Message contains inappropriate content",
                    violations: messageSanitization.violations
                }),
                { status: 400 }
            );
        }

        const sanitizedName = nameSanitization.sanitized;
        const sanitizedSubject = subjectSanitization.sanitized;
        const sanitizedMessage = messageSanitization.sanitized;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new NextResponse(
                JSON.stringify({ error: "Invalid email format" }),
                { status: 400 }
            );
        }

        // Additional length validations
        if (sanitizedName.length < 2) {
            return new NextResponse(
                JSON.stringify({ error: "Name must be at least 2 characters long" }),
                { status: 400 }
            );
        }

        if (sanitizedSubject.length < 5) {
            return new NextResponse(
                JSON.stringify({ error: "Subject must be at least 5 characters long" }),
                { status: 400 }
            );
        }

        if (sanitizedMessage.length < 10) {
            return new NextResponse(
                JSON.stringify({ error: "Message must be at least 10 characters long" }),
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

        const emailSubject = `Contact Form: ${escapeHTML(sanitizedSubject)}`;
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a73e8;">New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${escapeHTML(sanitizedName)}</p>
                <p><strong>Email:</strong> ${escapeHTML(email)}</p>
                <p><strong>Subject:</strong> ${escapeHTML(sanitizedSubject)}</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <p style="white-space: pre-wrap;">${escapeHTML(sanitizedMessage)}</p>
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
