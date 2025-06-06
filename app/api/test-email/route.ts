import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
    try {
        if (!process.env.ADMIN_EMAIL) {
            return NextResponse.json(
                {
                    error: "No admin email configured. Please set ADMIN_EMAIL in your environment variables.",
                },
                { status: 400 }
            );
        }

        const { data, error } = await resend.emails.send({
            from: `Cornell Tech Hub <notifications@${process.env.EMAIL_DOMAIN || "onboarding@resend.dev"}>`,
            to: process.env.ADMIN_EMAIL,
            subject: "Test Email from Cornell Tech Hub",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a73e8;">Test Email</h2>
                    <p>This is a test email to verify that the email notification system is working correctly.</p>
                    <p>If you're receiving this, the setup is successful!</p>
                    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
                        <p style="margin: 0;">Sent from: notifications@${process.env.EMAIL_DOMAIN || "onboarding@resend.dev"}</p>
                        <p style="margin: 0;">Time: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error sending test email:", error);
        return NextResponse.json(
            { error: "Failed to send test email" },
            { status: 500 }
        );
    }
}
