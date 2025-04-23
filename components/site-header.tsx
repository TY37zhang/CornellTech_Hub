"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Home, MessageSquare, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image
                        src="/placeholder.svg?height=32&width=32"
                        alt="Cornell Tech Logo"
                        width={32}
                        height={32}
                        className="rounded-md"
                    />
                    <span className="text-xl font-bold">Cornell Tech Hub</span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    <Link
                        href="/"
                        className={cn(
                            "transition-colors hover:text-primary flex items-center gap-1",
                            pathname === "/"
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                    <Link
                        href="/courses"
                        className={cn(
                            "transition-colors hover:text-primary flex items-center gap-1",
                            pathname.startsWith("/courses")
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Courses
                    </Link>
                    <Link
                        href="/forum"
                        className={cn(
                            "transition-colors hover:text-primary flex items-center gap-1",
                            pathname.startsWith("/forum")
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Forum
                    </Link>
                    {/* Marketplace link temporarily disabled
          <Link
            href="/marketplace"
            className={cn(
              "transition-colors hover:text-primary flex items-center gap-1",
              pathname.startsWith("/marketplace") ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            Marketplace
          </Link>
          */}
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
