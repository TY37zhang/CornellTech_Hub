import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";

const CoursePreview = dynamic(() => import("./components/CoursePreview"), {
  loading: () => (
    <div className="w-full h-40 bg-surface-hover animate-pulse border border-subtle" />
  ),
});

const ForumPreview = dynamic(() => import("./components/ForumPreview"), {
  loading: () => (
    <div className="w-full h-40 bg-surface-hover animate-pulse border border-subtle" />
  ),
});

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    default: "Cornell Tech Hub | Student Community & Resources",
    template: "%s | Cornell Tech Hub",
  },
  description:
    "Cornell Tech Hub is a student-run community where you can connect with peers, share course reviews, and discover resources for your Cornell Tech journey.",
  keywords: [
    "Cornell Tech",
    "Course Reviews",
    "Student Forum",
    "Graduate School",
    "NYC Campus",
  ],
  openGraph: {
    title: "Cornell Tech Hub - Student Community & Resources",
    description:
      "Connect with peers, share reviews, and discover resources for your Cornell Tech journey.",
    url: "https://cornell-tech-hub.com/",
    siteName: "Cornell Tech Hub",
    images: [
      {
        url: "/images/siteshot.png",
        width: 1200,
        height: 630,
        alt: "Cornell Tech Hub - Student community platform for course reviews, forum discussions, and resources",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cornell Tech Hub",
    description:
      "Connect with peers, share reviews, and discover resources for your Cornell Tech journey.",
    images: ["/images/siteshot.png"],
  },
  alternates: {
    canonical: "https://www.cornelltechhub.info/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Dashboard() {
  const sessionPromise = getServerSession(authOptions);

  let topCourses: any[] = [];
  let forumPosts: any[] = [];
  let topCourseError: string | null = null;
  let forumError: string | null = null;

  try {
    const [coursesRes, forumRes] = await Promise.allSettled([
      import("@/lib/services/courses").then(({ getAggregatedCourses }) =>
        getAggregatedCourses({ sortBy: "popular", limit: 5 }),
      ),
      import("@/app/forum/actions").then(({ getForumPosts }) =>
        getForumPosts("", 5, 0),
      ),
    ]);

    if (coursesRes.status === "fulfilled") {
      topCourses = coursesRes.value.courses;
    } else {
      console.error("Error loading courses", coursesRes.reason);
      topCourseError = "Failed to load courses";
    }

    if (forumRes.status === "fulfilled") {
      forumPosts = forumRes.value.posts;
    } else {
      console.error("Error loading forum posts", forumRes.reason);
      forumError = "Failed to load forum posts";
    }
  } catch (err) {
    console.error("Unexpected error fetching homepage data", err);
  }

  const session = await sessionPromise;

  return (
    <div className="flex min-h-screen flex-col bg-surface text-t1">
      <main className="flex-1">
        {/* ════════════════════ HERO ════════════════════ */}
        <section className="relative w-full overflow-hidden border-b border-subtle">
          {/* Dot grid */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, hsl(var(--tc-dot-grid)) 0.5px, transparent 0.5px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--tc-surface)/.6)] to-[hsl(var(--tc-surface))]" />
          </div>

          <div className="mx-auto max-w-[980px] px-6 pt-28 pb-20 md:pt-40 md:pb-28 lg:pt-48 lg:pb-32">
            <div className="flex flex-col items-start">
              {/* Terminal prompt */}
              <p className="font-mono text-sm text-t3 mb-6">
                <span className="text-red-500">$</span> cat /welcome.md
              </p>

              {/* Headline */}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
                Cornell Tech Hub
              </h1>

              <p className="mt-6 max-w-[540px] text-base leading-relaxed text-t2 md:text-lg">
                Course reviews, student discussions, and every resource you
                need. Built by students, for students.
              </p>

              {/* CTA row */}
              <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="h-11 w-full sm:w-auto rounded-none px-6 text-sm font-mono font-medium bg-cta text-cta hover:bg-cta-hover transition-colors"
                  >
                    Browse Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/forum">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 w-full sm:w-auto rounded-none px-6 text-sm font-mono font-medium border-cta-outline bg-transparent text-cta-outline hover:bg-cta-outline-hover hover:text-t1 transition-colors"
                  >
                    Join Forum
                  </Button>
                </Link>
              </div>

              {/* Disclaimer */}
              <p className="mt-16 font-mono text-[11px] text-code-comment leading-relaxed">
                // not affiliated with Cornell Tech. this is a student project.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════ NAVIGATE ════════════════════ */}
        <section className="w-full border-b border-subtle">
          <div className="mx-auto max-w-[980px] px-6 py-20 md:py-28">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
              Navigate
            </p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Three tools. Zero fluff.
            </h2>

            {/* Flat rows — no cards */}
            <div className="mt-12 divide-y divide-subtle border-y border-subtle">
              <Link
                href="/courses"
                className="group flex items-center justify-between py-5 px-1 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-sm text-t4 w-6 shrink-0">
                    01
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-t1 group-hover:text-t1 transition-colors">
                      Course Reviews
                    </h3>
                    <p className="text-sm text-t3 mt-0.5 truncate">
                      Honest reviews from students who took the class
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-t4 group-hover:text-t1 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/forum"
                className="group flex items-center justify-between py-5 px-1 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-sm text-t4 w-6 shrink-0">
                    02
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-t1 group-hover:text-t1 transition-colors">
                      Student Forum
                    </h3>
                    <p className="text-sm text-t3 mt-0.5 truncate">
                      Questions, advice, and discussions across programs
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-t4 group-hover:text-t1 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/planner"
                className="group flex items-center justify-between py-5 px-1 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-sm text-t4 w-6 shrink-0">
                    03
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-t1 group-hover:text-t1 transition-colors">
                      Course Planner
                    </h3>
                    <p className="text-sm text-t3 mt-0.5 truncate">
                      Map your semesters and track requirements
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-t4 group-hover:text-t1 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════ LIVE DATA ════════════════════ */}
        <section className="w-full border-b border-subtle">
          <div className="mx-auto max-w-[980px] px-6 py-20 md:py-28">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
              Live
            </p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Latest activity.
            </h2>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-px bg-[hsl(var(--tc-subtle-border))]">
              {/* Courses column */}
              <div className="bg-surface">
                <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
                  <span className="font-mono text-xs uppercase tracking-wider text-t3">
                    Top Courses
                  </span>
                  <span className="font-mono text-xs text-t4">rating</span>
                </div>
                <CoursePreview
                  topCourses={topCourses}
                  topCourseError={topCourseError}
                />
              </div>

              {/* Forum column */}
              <div className="bg-surface">
                <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
                  <span className="font-mono text-xs uppercase tracking-wider text-t3">
                    Recent Discussions
                  </span>
                  <span className="font-mono text-xs text-t4">replies</span>
                </div>
                <ForumPreview forumPosts={forumPosts} forumError={forumError} />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════ RESOURCES ════════════════════ */}
        <section className="w-full border-b border-subtle">
          <div className="mx-auto max-w-[980px] px-6 py-20 md:py-28">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
              Resources
            </p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Quick links.
            </h2>

            <div className="mt-12 divide-y divide-subtle border-y border-subtle">
              {[
                {
                  title: "Campus Events",
                  desc: "cornelltech.campusgroups.com",
                  href: "https://cornelltech.campusgroups.com/events",
                },
                {
                  title: "Handshake",
                  desc: "cornell.joinhandshake.com",
                  href: "https://cornell.joinhandshake.com/stu/postings",
                },
                {
                  title: "The House @ Cornell Tech",
                  desc: "thehouseatcornelltech.com",
                  href: "https://thehouseatcornelltech.com/",
                },
                {
                  title: "Admitted Resources",
                  desc: "admissions.tech.cornell.edu",
                  href: "https://admissions.tech.cornell.edu/dnu-admitted/resources/",
                },
              ].map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-4 px-1 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-sm font-medium text-t1 group-hover:text-t1 transition-colors shrink-0">
                      {link.title}
                    </span>
                    <span className="font-mono text-xs text-t4 truncate hidden sm:inline">
                      {link.desc}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-t4 group-hover:text-t2 shrink-0 ml-4 transition-colors">
                    ↗
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ CTA (logged-out) ════════════════════ */}
        {!session && (
          <section className="w-full border-b border-subtle">
            <div className="mx-auto max-w-[980px] px-6 py-24 md:py-32">
              <div className="max-w-lg">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
                  Get Started
                </p>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Join the community.
                </h2>
                <p className="mt-4 text-base text-t2 leading-relaxed">
                  Create an account and make the most of your Cornell Tech
                  experience.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <Link href="/auth/signup" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-11 rounded-none px-6 text-sm font-mono font-medium bg-cta text-cta hover:bg-cta-hover transition-colors"
                    >
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="font-mono text-sm text-t3 hover:text-t1 transition-colors"
                  >
                    or sign in →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
