"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    Home,
    Menu,
    MessageSquare,
    ShoppingBag,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

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
        /* Marketplace route temporarily disabled
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: ShoppingBag,
      active: pathname.startsWith("/marketplace"),
    },
    */
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
                <div className="px-7">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center space-x-2"
                            onClick={() => setOpen(false)}
                        >
                            <span className="font-bold">Cornell Tech Hub</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="h-8 w-8"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>
                    <nav className="mt-8 flex flex-col gap-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-2 text-base font-medium transition-colors hover:text-foreground",
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
                    <div className="mt-8 flex flex-col gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href="/auth/login"
                                onClick={() => setOpen(false)}
                            >
                                Sign In
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href="/auth/signup"
                                onClick={() => setOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
