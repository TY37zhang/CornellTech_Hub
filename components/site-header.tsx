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
    BookmarkPlus,
    Calendar,
    MessageCircle,
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
import { motion } from "framer-motion";

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/forum", label: "Forum", icon: MessageSquare },
    { href: "/planner", label: "Planner", icon: Calendar },
];

export function SiteHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="flex h-14 items-center justify-between px-1 md:px-2">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center gap-1 md:gap-2"
                >
                    <Link href="/" className="flex items-center gap-1 md:gap-2">
                        <Image
                            src="/images/logo/logo.png"
                            alt="Cornell Tech Logo"
                            width={32}
                            height={32}
                            className="rounded-md"
                        />
                        <span className="text-base sm:text-lg md:text-lg font-bold whitespace-nowrap">
                            Cornell Tech Hub
                        </span>
                    </Link>
                </motion.div>
                <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-8">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.href}
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.1 + index * 0.1,
                                    }}
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "transition-colors hover:text-primary flex items-center gap-1",
                                            pathname === item.href ||
                                                pathname.startsWith(
                                                    item.href + "/"
                                                )
                                                ? "font-medium text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </nav>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center gap-2"
                >
                    <div className="md:hidden">
                        <MobileNav />
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full ring-0 focus:ring-0 focus:ring-offset-0 p-0"
                                    >
                                        <Avatar className="h-8 w-8 ring-0">
                                            <AvatarImage
                                                src={session.user?.image || ""}
                                                alt={session.user?.name || ""}
                                                className="ring-0"
                                            />
                                            <AvatarFallback className="ring-0">
                                                {session.user?.name?.charAt(
                                                    0
                                                ) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center justify-start gap-2 p-2"
                                    >
                                        <div className="flex flex-col space-y-1 leading-none">
                                            <p className="font-medium">
                                                {session.user?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </motion.div>
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
                                            href="/forum/saved"
                                            className="flex items-center cursor-pointer"
                                        >
                                            <BookmarkPlus className="mr-2 h-4 w-4" />
                                            <span>Saved Posts</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/my-reviews"
                                            className="flex items-center cursor-pointer"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span>My Reviews</span>
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
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/feedback"
                                            className="flex items-center cursor-pointer"
                                        >
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            <span>Feedback</span>
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
                </motion.div>
            </div>
        </motion.header>
    );
}
