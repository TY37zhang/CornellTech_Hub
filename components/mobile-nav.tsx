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
    Calendar,
    MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from "@/components/ui/sheet";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.3,
        },
    }),
};

const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.3 + i * 0.1,
            duration: 0.3,
        },
    }),
};

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
        {
            href: "/planner",
            label: "Planner",
            icon: Calendar,
            active: pathname.startsWith("/planner"),
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
                    <SheetDescription className="sr-only">
                        Navigation menu for Cornell Tech Hub.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-6 py-4">
                    <nav className="flex flex-col gap-4">
                        <AnimatePresence>
                            {routes.map((route, i) => (
                                <motion.div
                                    key={`${route.href}-${i}`}
                                    custom={i}
                                    variants={navItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <Link
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
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </nav>
                    {session ? (
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <AnimatePresence>
                                <motion.div
                                    key="my-posts"
                                    custom={0}
                                    variants={buttonVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
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
                                </motion.div>
                                <motion.div
                                    key="settings"
                                    custom={1}
                                    variants={buttonVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
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
                                </motion.div>
                                <motion.div
                                    key="feedback"
                                    custom={2}
                                    variants={buttonVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="w-[180px]"
                                    >
                                        <Link
                                            href="/feedback"
                                            onClick={() => setOpen(false)}
                                        >
                                            Feedback
                                        </Link>
                                    </Button>
                                </motion.div>
                                <motion.div
                                    key="logout"
                                    custom={3}
                                    variants={buttonVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <Button
                                        variant="destructive"
                                        className="w-[180px]"
                                        onClick={() => {
                                            setOpen(false);
                                            signOut();
                                        }}
                                    >
                                        Log Out
                                    </Button>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <AnimatePresence>
                                <motion.div
                                    key="signin"
                                    custom={0}
                                    variants={buttonVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
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
                                </motion.div>
                                <motion.div
                                    key="signup"
                                    custom={1}
                                    variants={buttonVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <Button asChild className="w-[180px]">
                                        <Link
                                            href="/auth/signup"
                                            onClick={() => setOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </Button>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
