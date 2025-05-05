import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Cornell Tech Hub",
    description: "Privacy policy for Cornell Tech Hub platform",
};

export default function PrivacyPolicy() {
    return (
        <div className="container max-w-4xl py-8">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose prose-gray dark:prose-invert">
                <p className="text-muted-foreground mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        1. Introduction
                    </h2>
                    <p>
                        Welcome to Cornell Tech Hub. We are committed to
                        protecting your privacy and ensuring that your personal
                        information is handled in a safe and responsible manner.
                        This Privacy Policy outlines how we collect, use, and
                        protect your information when you use our platform.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        2. Information We Collect
                    </h2>
                    <h3 className="text-xl font-medium mb-2">
                        2.1 Personal Information
                    </h3>
                    <p>We may collect the following personal information:</p>
                    <ul className="list-disc pl-6">
                        <li>Name and contact information</li>
                        <li>Cornell Tech email address</li>
                        <li>Academic information</li>
                        <li>Profile information</li>
                        <li>User-generated content</li>
                    </ul>

                    <h3 className="text-xl font-medium mb-2 mt-4">
                        2.2 Usage Data
                    </h3>
                    <p>
                        We automatically collect information about how you
                        interact with our platform, including:
                    </p>
                    <ul className="list-disc pl-6">
                        <li>IP address</li>
                        <li>Browser type and version</li>
                        <li>Pages visited</li>
                        <li>Time spent on pages</li>
                        <li>Device information</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        3. How We Use Your Information
                    </h2>
                    <p>We use your information to:</p>
                    <ul className="list-disc pl-6">
                        <li>Provide and maintain our services</li>
                        <li>Improve user experience</li>
                        <li>Communicate with you about platform updates</li>
                        <li>Ensure platform security</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        4. Data Security
                    </h2>
                    <p>
                        We implement appropriate security measures to protect
                        your personal information. However, no method of
                        transmission over the internet is 100% secure, and we
                        cannot guarantee absolute security.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        5. Your Rights
                    </h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your information</li>
                        <li>Opt-out of communications</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        6. Contact Us
                    </h2>
                    <p>
                        If you have any questions about this Privacy Policy,
                        please contact us at:
                    </p>
                    <p className="mt-2">
                        Email:{" "}
                        <a
                            href="mailto:hi@cornelltechhub.info"
                            className="text-primary hover:underline"
                        >
                            hi@cornelltechhub.info
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
