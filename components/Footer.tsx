import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-black">
      <div className="w-full max-w-[980px] mx-auto px-6 flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between md:py-16">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-sm text-white">
            <span className="text-red-500">[</span>
            cornell-tech-hub
            <span className="text-red-500">]</span>
          </span>
          <p className="text-sm text-neutral-600 max-w-xs leading-relaxed font-mono">
            // a student-built resource platform
            <br />
            // not affiliated with Cornell Tech
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div className="grid gap-2.5 text-sm">
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-neutral-500 mb-1">
              Resources
            </h3>
            <Link
              href="/courses"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /courses
            </Link>
            <Link
              href="/forum"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /forum
            </Link>
            <Link
              href="/planner"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /planner
            </Link>
            <Link
              href="https://cornelltech.campusgroups.com/events"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /events ↗
            </Link>
          </div>
          <div className="grid gap-2.5 text-sm">
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-neutral-500 mb-1">
              Support
            </h3>
            <Link
              href="/feedback"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /feedback
            </Link>
            <Link
              href="/faq"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /faq
            </Link>
            <Link
              href="/coming-soon"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /help
            </Link>
          </div>
          <div className="grid gap-2.5 text-sm">
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-neutral-500 mb-1">
              Legal
            </h3>
            <Link
              href="/privacy-policy"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /terms
            </Link>
            <Link
              href="/contact"
              className="text-neutral-500 hover:text-white transition-colors font-mono text-xs"
            >
              /contact
            </Link>
          </div>
        </nav>
      </div>
      <div className="w-full border-t border-white/[0.06]">
        <div className="w-full max-w-[980px] mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-[11px] text-neutral-600">
          <span>&copy; {new Date().getFullYear()} cornell-tech-hub</span>
          <span>
            built by{" "}
            <Link
              href="https://www.tianyinzhang.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              @tyzhang
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
