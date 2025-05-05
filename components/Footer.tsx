import Image from "next/image";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:py-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/logo/logo.png"
                            alt="Cornell Tech Logo"
                            width={24}
                            height={24}
                            className="rounded-md"
                        />
                        <span className="text-lg font-bold">
                            Cornell Tech Hub
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        A resource platform for Cornell Tech students
                    </p>
                </div>
                <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    <div className="grid gap-3 text-sm">
                        <h3 className="font-semibold">Resources</h3>
                        <Link
                            href="/forum"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Forum
                        </Link>
                        <Link
                            href="https://admissions.tech.cornell.edu/dnu-admitted/resources/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Resources
                        </Link>
                        <Link
                            href="https://cornelltech.campusgroups.com/events"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Events
                        </Link>
                    </div>
                    <div className="grid gap-3 text-sm">
                        <h3 className="font-semibold">Support</h3>
                        <Link
                            href="/feedback"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Feedback
                        </Link>
                        <Link
                            href="/coming-soon"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Help Center
                        </Link>
                        {/* <Link
                            href="/coming-soon"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Contact Us
                        </Link> */}
                        <Link
                            href="/faq"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            FAQ
                        </Link>
                    </div>
                    <div className="grid gap-3 text-sm">
                        <h3 className="font-semibold">Legal</h3>
                        <Link
                            href="/privacy-policy"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms-of-service"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/contact"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Contact
                        </Link>
                    </div>
                </nav>
            </div>
            <div className="container py-2 text-center text-sm text-muted-foreground border-t">
                <div>
                    &copy; {new Date().getFullYear()} Cornell Tech Hub. All
                    rights reserved.
                </div>
                <div className="text-xs mt-1">
                    This is a student-built independent project and is not
                    officially affiliated with Cornell Tech.
                </div>
                <div className="text-xs mt-1">
                    Designed and developed by{" "}
                    <Link
                        href="https://www.tianyinzhang.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        Tianyin Zhang
                    </Link>{" "}
                    with ♡
                </div>
            </div>
        </footer>
    );
}
