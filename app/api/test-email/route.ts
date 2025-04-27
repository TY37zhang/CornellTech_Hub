import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
    try {
        const { data, error } = await resend.emails.send({
            from: "Cornell Tech Hub <onboarding@resend.dev>",
            to: "delivered@resend.dev", // Resend's testing email address
            subject: "Test Email from Cornell Tech Hub",
            html: `
                <div>
                    <h2>Test Email</h2>
                    <p>This is a test email to verify that the email notification system is working correctly.</p>
                    <p>If you're receiving this, the setup is successful!</p>
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
