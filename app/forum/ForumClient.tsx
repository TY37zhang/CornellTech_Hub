"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getForumStats, getTopContributors } from "./actions";

// NOTE: We do not import getForumPosts; we hit the API route instead to stay RSC-safe.

interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  category: string;
  categoryColor: string;
  content: string;
  tags: string[];
  replies: number;
  likes: number;
  views: number;
  badge?: {
    text: string;
    color: string;
  };
  createdAt: string;
  isHot: boolean;
  isNew: boolean;
  hotScore: number;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Academics: "bg-red-100 text-red-800 hover:bg-red-100",
    Career: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    "Campus Life": "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Technology: "bg-green-100 text-green-800 hover:bg-green-100",
    Events: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    General: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  };
  return colors[category] || colors.General;
}

function formatDate(date: string): string {
  const now = new Date();
  const postDate = new Date(date);
  const diffTime = Math.abs(now.getTime() - postDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Memoized hot score calculation to avoid recalculation
const calculateHotScore = (() => {
  const cache = new Map();
  return (thread: {
    likes: number;
    replies: number;
    views: number;
    createdAt: string;
  }): { isHot: boolean; score: number } => {
    const cacheKey = `${thread.likes}-${thread.replies}-${thread.views}-${thread.createdAt}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const now = new Date();
    const threadDate = new Date(thread.createdAt);
    const hoursSinceCreation =
      (now.getTime() - threadDate.getTime()) / (1000 * 60 * 60);
    const weights = { likes: 1, replies: 1.5, views: 0.2, recency: 2 };
    const likeScore = thread.likes * weights.likes;
    const replyScore = thread.replies * weights.replies;
    const viewScore = thread.views * weights.views;
    const recencyBoost = Math.max(
      0,
      100 - (hoursSinceCreation / 24) * weights.recency,
    );
    const totalScore = likeScore + replyScore + viewScore + recencyBoost;
    const threshold = 50 + (hoursSinceCreation / 24) * 10;
    const result = { isHot: totalScore > threshold, score: totalScore };

    cache.set(cacheKey, result);
    return result;
  };
})();

const getVisiblePages = (current: number, total: number): number[] => {
  const pages: number[] = [];
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  if (current <= 3) end = Math.min(5, total);
  else if (current >= total - 2) start = Math.max(1, total - 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
};

interface ForumClientProps {
  initialPosts?: any[]; // raw posts from server API
  initialStats?: any;
  initialContributors?: any[];
  initialTotalPages?: number;
}

function ForumClient({
  initialPosts = [],
  initialStats = null,
  initialContributors = [],
  initialTotalPages = 1,
}: ForumClientProps) {
  // Memoized initial thread processing
  const initialThreads = useMemo(() => {
    if (initialPosts.length > 0) {
      return initialPosts
        .map((post: any) => {
          if (!post || typeof post !== "object") return null;
          const hotStatus = calculateHotScore({
            likes: post.like_count || 0,
            replies: post.reply_count || 0,
            views: post.view_count || 0,
            createdAt: post.created_at || new Date().toISOString(),
          });
          return {
            id: post.id || "",
            title: post.title || "",
            author: {
              name: post.author_name || "Anonymous",
              avatar:
                post.author_avatar || "/placeholder.svg?height=32&width=32",
              initials: getInitials(post.author_name || "Anonymous"),
            },
            category: post.category_name || "Uncategorized",
            categoryColor: getCategoryColor(
              post.category_name || "Uncategorized",
            ),
            content: post.content || "",
            tags: Array.isArray(post.tags) ? post.tags : [],
            replies:
              typeof post.reply_count === "number" ? post.reply_count : 0,
            likes: typeof post.like_count === "number" ? post.like_count : 0,
            views: typeof post.view_count === "number" ? post.view_count : 0,
            createdAt: formatDate(post.created_at || new Date().toISOString()),
            isHot: hotStatus.isHot,
            hotScore: hotStatus.score,
            isNew:
              new Date(post.created_at || Date.now()).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000,
          } as Thread;
        })
        .filter(Boolean) as Thread[];
    }
    return [];
  }, [initialPosts]);

  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [forumStats, setForumStats] = useState<any>(initialStats);
  const [topContributors, setTopContributors] =
    useState<any[]>(initialContributors);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const threadsPerPage = 10;
  const [activeTab, setActiveTab] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstLoadRef = useRef(true);

  // Debounced search to reduce API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function to serialize errors to readable strings
  const serializeError = (error: unknown): string => {
    if (!error) return "An unknown error occurred";

    // Handle Error objects
    if (error instanceof Error) {
      return error.message || "An error occurred";
    }

    // Handle string errors
    if (typeof error === "string") {
      return error;
    }

    // Handle objects with error property
    if (typeof error === "object" && error !== null) {
      const errorObj = error as any;

      // Try common error properties
      if (typeof errorObj.message === "string") {
        return errorObj.message;
      }

      if (typeof errorObj.error === "string") {
        return errorObj.error;
      }

      // Handle rate limit error structure: { message: string, retryAfter: number }
      if (
        typeof errorObj.message === "string" &&
        typeof errorObj.retryAfter === "number"
      ) {
        return `${errorObj.message} (retry in ${errorObj.retryAfter} seconds)`;
      }

      if (typeof errorObj.statusText === "string") {
        return `HTTP Error: ${errorObj.statusText}`;
      }

      // Try to extract meaningful information from the object
      try {
        const jsonStr = JSON.stringify(errorObj);
        if (jsonStr !== "{}") {
          return `Error: ${jsonStr}`;
        }
      } catch {
        // JSON.stringify failed, continue to fallback
      }
    }

    // Final fallback
    return "Failed to fetch data";
  };

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * threadsPerPage;
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        limit: threadsPerPage.toString(),
        offset: offset.toString(),
      });
      const res = await fetch(`/api/forum/posts?${params.toString()}`);
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : serializeError(errorData.error) ||
              `HTTP error! status: ${res.status}`;
        throw new Error(errorMessage);
      }
      const postsData = await res.json();
      const [stats, contributors] = await Promise.all([
        getForumStats(),
        getTopContributors(),
      ]);
      if (!postsData.success)
        throw new Error(postsData.error || "Failed to fetch posts");
      if (!Array.isArray(postsData.posts))
        throw new Error("Invalid response format");

      const formattedThreads: Thread[] = postsData.posts
        .map((post: any) => {
          if (!post || typeof post !== "object") return null;

          // Ensure numeric values are properly typed
          const likeCount =
            typeof post.like_count === "number" ? post.like_count : 0;
          const replyCount =
            typeof post.reply_count === "number" ? post.reply_count : 0;
          const viewCount =
            typeof post.view_count === "number" ? post.view_count : 0;

          const hotStatus = calculateHotScore({
            likes: likeCount,
            replies: replyCount,
            views: viewCount,
            createdAt: post.created_at || new Date().toISOString(),
          });
          return {
            id: post.id || "",
            title: post.title || "",
            author: {
              name: post.author_name || "Anonymous",
              avatar:
                post.author_avatar || "/placeholder.svg?height=32&width=32",
              initials: getInitials(post.author_name || "Anonymous"),
            },
            category: post.category_name || "Uncategorized",
            categoryColor: getCategoryColor(
              post.category_name || "Uncategorized",
            ),
            content: post.content || "",
            tags: Array.isArray(post.tags) ? post.tags : [],
            replies: replyCount,
            likes: likeCount,
            views: viewCount,
            createdAt: formatDate(post.created_at || new Date().toISOString()),
            isHot: hotStatus.isHot,
            hotScore: hotStatus.score,
            isNew:
              new Date(post.created_at || Date.now()).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000,
          } as Thread;
        })
        .filter(Boolean) as Thread[];
      setThreads(formattedThreads);
      setForumStats(stats);
      setTopContributors(contributors);
      setTotalPages(Math.ceil(postsData.total / threadsPerPage));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching forum data:", err);

      // Enhanced error logging for debugging
      if (err instanceof Error) {
        console.error("Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      } else {
        console.error("Non-Error object caught:", {
          type: typeof err,
          value: err,
          stringified: (() => {
            try {
              return JSON.stringify(err);
            } catch {
              return "Unable to stringify error";
            }
          })(),
        });
      }

      const errorMessage = serializeError(err);
      setError(errorMessage);
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, threadsPerPage]);

  // Fetch posts whenever dependencies change (like course page)
  useEffect(() => {
    // Skip fetching on the very first render when we already have server data
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Memoized filtering and sorting
  const filteredThreads = useMemo(() => {
    let result = [...threads];
    if (activeTab !== "all")
      result = result.filter((t) => t.category === activeTab);
    if (selectedCategory !== "all")
      result = result.filter(
        (t) => t.category.toLowerCase() === selectedCategory,
      );
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return result;
  }, [activeTab, selectedCategory, threads]);

  // --- inline style fix for mobile title truncation ---
  if (typeof document !== "undefined") {
    const id = "forum-title-style";
    if (!document.getElementById(id)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = id;
      styleSheet.textContent = `@media (max-width: 900px){.truncate-title{max-width:15ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#a3a3a3;}}`;
      document.head.appendChild(styleSheet);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-t1">
      <div className="flex-1">
        {/* HERO */}
        <section className="w-full border-b border-subtle">
          <div className="mx-auto max-w-[980px] px-6 pt-28 pb-12 md:pt-36 md:pb-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
              Forum
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Student Forum.
            </h1>
            <p className="mt-3 text-base text-t3">
              Connect, discuss, and share knowledge.
            </p>
            <div className="mt-8 w-full max-w-lg relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-t4" />
              <input
                type="search"
                placeholder="Search discussions by topic, keyword, or author..."
                className="w-full pl-9 h-10 bg-surface-hover border border-strong text-t1 placeholder:text-t4 font-mono text-sm focus:outline-none focus:border-cta-outline rounded-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </section>

        {/* MAIN SECTION */}
        <section className="w-full border-b border-subtle">
          <div className="mx-auto max-w-[980px] px-6 py-12 md:py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-t3 mb-2">
                  Browse
                </p>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Discussions
                </h2>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-10">
              {/* LEFT COLUMN */}
              <div className="flex-1 min-w-0">
                <div className="w-full">
                  <div className="flex w-full items-center justify-between border-b border-subtle pb-4">
                    {isMobile ? (
                      <div className="flex items-center">
                        <Select value={activeTab} onValueChange={setActiveTab}>
                          <SelectTrigger className="w-[200px] rounded-none bg-surface-hover border-strong text-t2 font-mono text-sm">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none bg-surface border-strong">
                            {[
                              "all",
                              "Academics",
                              "Career",
                              "Campus Life",
                              "Technology",
                              "Events",
                              "General",
                            ].map((cat) => (
                              <SelectItem
                                key={cat}
                                value={cat}
                                className="font-mono text-sm text-t2 focus:text-t1 focus:bg-surface-active rounded-none"
                              >
                                {cat === "all" ? "All Discussions" : cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                        {[
                          "all",
                          "Academics",
                          "Career",
                          "Campus Life",
                          "Technology",
                          "Events",
                          "General",
                        ].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`font-mono text-sm px-3 py-1.5 border-b-2 transition-colors whitespace-nowrap ${
                              activeTab === cat
                                ? "border-cta-outline text-t1"
                                : "border-transparent text-t3 hover:text-t2"
                            }`}
                          >
                            {cat === "all" ? "All Discussions" : cat}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Link href="/forum/create">
                        <Button className="gap-1.5 bg-cta text-cta hover:bg-cta-hover rounded-none font-mono text-sm h-9 px-4">
                          <PlusCircle className="h-4 w-4" />
                          {!isMobile && <span>New Discussion</span>}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6">
                    {loading ? (
                      <div className="divide-y divide-subtle border-t border-subtle">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="py-5 px-1 space-y-2">
                            <div className="h-5 w-2/3 bg-surface-active animate-pulse" />
                            <div className="h-4 w-full bg-surface-hover animate-pulse" />
                            <div className="h-3 w-1/3 bg-surface-hover animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-16">
                        <p className="font-mono text-sm text-red-500">
                          {error}
                        </p>
                        <button
                          onClick={() => {
                            setError(null);
                            fetchData();
                          }}
                          className="mt-4 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-none font-mono text-sm hover:bg-red-500/20 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : filteredThreads.length > 0 ? (
                      <div className="divide-y divide-subtle border-t border-subtle">
                        {filteredThreads.map((thread) => (
                          <ForumThreadCard key={thread.id} thread={thread} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="font-mono text-sm text-t3">
                          No discussions found matching your search criteria.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="lg:w-[280px] flex-none">
                <div className="space-y-6">
                  {/* Forum Categories */}
                  <div className="border border-subtle divide-y divide-subtle hidden sm:block">
                    <div className="px-4 py-3">
                      <span className="font-mono text-xs uppercase tracking-wider text-t3">
                        Forum Categories
                      </span>
                    </div>
                    <div className="p-2">
                      {[
                        ["Academics", "text-red-500"],
                        ["Career", "text-blue-500"],
                        ["Campus Life", "text-purple-500"],
                        ["Technology", "text-amber-500"],
                        ["Events", "text-green-500"],
                        ["General", "text-orange-500"],
                      ].map(([name, dotColor]) => (
                        <Link
                          href={`/forum/categories/${String(name).toLowerCase().replace(" ", "-")}`}
                          key={String(name)}
                          className="flex items-center gap-3 px-2 py-2 hover:bg-surface-hover transition-colors"
                        >
                          <span
                            className={`w-1.5 h-1.5 ${dotColor} shrink-0`}
                            style={{ backgroundColor: "currentColor" }}
                          />
                          <span className="font-mono text-xs text-t2 hover:text-t1 transition-colors">
                            {String(name)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Forum Stats */}
                  <div className="border border-subtle divide-y divide-subtle">
                    <div className="px-4 py-3">
                      <span className="font-mono text-xs uppercase tracking-wider text-t3">
                        Forum Stats
                      </span>
                    </div>
                    <div className="px-4 py-2">
                      {[
                        ["Total Threads", forumStats?.totalThreads],
                        ["Total Posts", forumStats?.totalPosts],
                        ["New Today", forumStats?.newToday],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="font-mono text-xs text-t3">
                            {label}
                          </span>
                          <span className="font-mono text-sm text-t1">
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Contributors */}
                  <div className="border border-subtle divide-y divide-subtle">
                    <div className="px-4 py-3">
                      <span className="font-mono text-xs uppercase tracking-wider text-t3">
                        Top Contributors
                      </span>
                    </div>
                    <div className="px-4 py-2">
                      {topContributors.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 py-2"
                        >
                          <span className="font-mono text-xs text-t4 w-6 h-6 flex items-center justify-center bg-surface-active border border-subtle shrink-0">
                            {getInitials(c.name)}
                          </span>
                          <span className="text-sm text-t2">{c.name}</span>
                          <span className="font-mono text-xs text-t4 ml-auto">
                            {c.post_count} posts
                          </span>
                        </div>
                      ))}
                      {topContributors.length === 0 && (
                        <div className="text-center py-4 font-mono text-xs text-t4">
                          No contributors yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAGINATION + FOOTER CTA */}
        <section className="w-full border-t border-subtle">
          <div className="mx-auto max-w-[980px] px-6">
            {totalPages > 1 && (
              <div className="w-full flex justify-center py-8 border-b border-subtle">
                <nav
                  className="flex items-center gap-2"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    aria-label="First page"
                    className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {getVisiblePages(currentPage, totalPages).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-none font-mono text-sm ${
                          currentPage === page
                            ? "bg-cta text-cta hover:bg-cta-hover"
                            : "border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last page"
                    className="w-10 h-10 p-0 rounded-none border-strong bg-transparent text-t2 hover:bg-surface-active hover:text-t1 disabled:opacity-30"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </Button>
                </nav>
              </div>
            )}
            <div className="py-16 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                Join the Conversation
              </h2>
              <p className="mt-2 text-t3 text-sm">
                Have something to share? Start a new discussion.
              </p>
              <Link href="/forum/create">
                <Button className="mt-6 h-11 rounded-none px-6 font-mono text-sm bg-cta text-cta hover:bg-cta-hover">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Thread
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Memoized forum thread card component for better performance
const ForumThreadCard = memo(({ thread }: { thread: Thread }) => {
  return (
    <Link
      href={`/forum/${thread.id}`}
      className="group block border-b border-subtle py-5 px-1 hover:bg-surface-hover transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-t1 group-hover:text-t1 transition-colors truncate-title">
              {thread.title}
            </h3>
            {thread.isNew && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-green-500 border border-green-500/30 px-1.5 py-0.5">
                new
              </span>
            )}
            {thread.isHot && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-red-500 border border-red-500/30 px-1.5 py-0.5">
                {thread.hotScore > 200
                  ? "super hot"
                  : thread.hotScore > 150
                    ? "very hot"
                    : "hot"}
              </span>
            )}
          </div>
          <p className="text-sm text-t3 mt-1 line-clamp-1">
            {thread.content.length > 120
              ? thread.content.slice(0, 120) + "..."
              : thread.content}
          </p>
        </div>
        <span className="font-mono text-xs text-t4 shrink-0 uppercase px-2 py-0.5 bg-surface-hover border border-subtle">
          {thread.category}
        </span>
      </div>
      <div className="flex items-center gap-4 mt-3 font-mono text-xs text-t4">
        <span>{thread.author.name}</span>
        <span>{thread.createdAt}</span>
        <span>{thread.replies} replies</span>
        <span>{thread.likes} likes</span>
        <span>{thread.views} views</span>
      </div>
      {thread.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {thread.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-t4 border border-subtle px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
});

ForumThreadCard.displayName = "ForumThreadCard";

export default memo(ForumClient);
