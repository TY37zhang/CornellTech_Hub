import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Cornell Tech Hub",
    description: "Terms of service for Cornell Tech Hub platform",
};

export default function TermsOfService() {
    return (
        <div className="container max-w-4xl py-8">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="prose prose-gray dark:prose-invert">
                <p className="text-muted-foreground mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        1. Acceptance of Terms
                    </h2>
                    <p>
                        By accessing and using Cornell Tech Hub ("the
                        Platform"), you agree to be bound by these Terms of
                        Service. If you do not agree to these terms, please do
                        not use the Platform.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        2. User Eligibility
                    </h2>
                    <p>
                        The Platform is intended for use by Cornell Tech
                        students, faculty, and staff. By using the Platform, you
                        represent and warrant that you are a member of the
                        Cornell Tech community.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        3. User Responsibilities
                    </h2>
                    <p>As a user of the Platform, you agree to:</p>
                    <ul className="list-disc pl-6">
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account</li>
                        <li>
                            Use the Platform in compliance with Cornell Tech's
                            policies
                        </li>
                        <li>
                            Respect the intellectual property rights of others
                        </li>
                        <li>
                            Not engage in any activity that may harm the
                            Platform or other users
                        </li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        4. Content Guidelines
                    </h2>
                    <p>
                        Users are responsible for the content they post on the
                        Platform. You agree not to post content that:
                    </p>
                    <ul className="list-disc pl-6">
                        <li>Is illegal, harmful, or threatening</li>
                        <li>Violates intellectual property rights</li>
                        <li>
                            Contains personal information of others without
                            consent
                        </li>
                        <li>Is spam or commercial in nature</li>
                        <li>Is discriminatory or harassing</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        5. Intellectual Property
                    </h2>
                    <p>
                        The Platform and its original content, features, and
                        functionality are owned by Cornell Tech Hub and are
                        protected by international copyright, trademark, and
                        other intellectual property laws.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        6. Disclaimer of Warranties
                    </h2>
                    <p>
                        The Platform is provided "as is" without any warranties,
                        express or implied. We do not guarantee that the
                        Platform will be error-free or uninterrupted.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        7. Limitation of Liability
                    </h2>
                    <p>
                        Cornell Tech Hub shall not be liable for any indirect,
                        incidental, special, consequential, or punitive damages
                        resulting from your use of the Platform.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        8. Modifications to Terms
                    </h2>
                    <p>
                        We reserve the right to modify these terms at any time.
                        We will notify users of any material changes through the
                        Platform or via email.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                        9. Contact Information
                    </h2>
                    <p>
                        If you have any questions about these Terms of Service,
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
