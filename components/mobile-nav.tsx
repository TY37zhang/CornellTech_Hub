"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Menu, MessageSquare, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    const routes = [
        {
            href: "/",
            label: "Home",
            icon: Home,
            active: pathname === "/",
        },
        {
            href: "/courses",
            label: "Courses",
            icon: BookOpen,
            active: pathname.startsWith("/courses"),
        },
        {
            href: "/forum",
            label: "Forum",
            icon: MessageSquare,
            active: pathname.startsWith("/forum"),
        },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12">
                    <Menu className="h-8 w-8" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] px-0">
                <SheetHeader className="px-6 border-b pb-6">
                    <SheetTitle>Cornell Tech Hub</SheetTitle>
                </SheetHeader>
                <div className="px-6 py-4">
                    <nav className="flex flex-col gap-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-2 text-base font-medium transition-colors hover:text-foreground pl-2",
                                    route.active
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <route.icon className="h-5 w-5" />
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                    {session ? (
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <Button
                                variant="outline"
                                asChild
                                className="w-[180px]"
                            >
                                <Link
                                    href="/user/posts"
                                    onClick={() => setOpen(false)}
                                >
                                    My Posts
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="w-[180px]"
                            >
                                <Link
                                    href="/settings"
                                    onClick={() => setOpen(false)}
                                >
                                    Settings
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <Button
                                variant="outline"
                                asChild
                                className="w-[180px]"
                            >
                                <Link
                                    href="/auth/signin"
                                    onClick={() => setOpen(false)}
                                >
                                    Sign In
                                </Link>
                            </Button>
                            <Button asChild className="w-[180px]">
                                <Link
                                    href="/auth/signup"
                                    onClick={() => setOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
