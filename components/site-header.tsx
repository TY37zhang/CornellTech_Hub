"use client";

import Link from "next/link";
import Image from "next/image";
import {
    BookOpen,
    Home,
    MessageSquare,
    ShoppingBag,
    Settings,
    LogOut,
    FileText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "@/components/mobile-nav";

export function SiteHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="flex flex-1 items-center gap-2">
                    <div className="md:hidden">
                        <MobileNav />
                    </div>
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/placeholder.svg?height=32&width=32"
                            alt="Cornell Tech Logo"
                            width={32}
                            height={32}
                            className="rounded-md"
                        />
                        <span className="text-xl font-bold">
                            Cornell Tech Hub
                        </span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center justify-center flex-1 gap-6 text-sm">
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
                <div className="flex flex-1 items-center justify-end gap-2">
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-8 w-8 rounded-full"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={session.user?.image || ""}
                                            alt={session.user?.name || ""}
                                        />
                                        <AvatarFallback>
                                            {session.user?.name?.charAt(0) ||
                                                "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium">
                                            {session.user?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/user/posts"
                                        className="flex items-center cursor-pointer"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>My Posts</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/settings"
                                        className="flex items-center cursor-pointer"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/auth/signin">Sign In</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/auth/signup">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
