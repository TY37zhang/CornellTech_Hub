"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  Menu,
  MessageSquare,
  Calendar,
  MessageCircle,
  UserCog,
  Shield,
  BookmarkPlus,
  FileText,
  Settings,
  MessageCircleQuestion,
  LogOut,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { isAdmin, isMod } from "@/lib/roles";
import { useTheme } from "next-themes";
import { createPortal } from "react-dom";

// ── Drawer backdrop ──
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" as const, delay: 0.1 },
  },
};

// ── Drawer panel ──
const drawerVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 350,
      mass: 0.8,
    },
  },
  exit: {
    y: "100%",
    transition: {
      type: "spring" as const,
      damping: 35,
      stiffness: 400,
      mass: 0.6,
    },
  },
};

// ── Staggered content container ──
const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

// ── Individual items ──
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

// ── Nav grid items (slightly different feel) ──
const navGridVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 22,
      stiffness: 280,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 6,
    transition: { duration: 0.12, ease: "easeIn" as const },
  },
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

  const accountLinks = [
    ...(session && isAdmin(session.user)
      ? [{ href: "/admin", label: "Admin Panel", icon: UserCog }]
      : []),
    ...(session && isMod(session.user)
      ? [{ href: "/admin/moderation", label: "Moderation", icon: Shield }]
      : []),
    { href: "/user/posts", label: "My Posts", icon: FileText },
    { href: "/forum/saved", label: "Saved Posts", icon: BookmarkPlus },
    { href: "/my-reviews", label: "My Reviews", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/feedback", label: "Feedback", icon: MessageCircleQuestion },
  ];

  const drawerContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="mobile-nav-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* ── Drawer panel ── */}
          <motion.div
            key="mobile-nav-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ backgroundColor: "hsl(var(--background))" }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] flex flex-col border-t border-strong rounded-none"
          >
            {/* ── Handle bar ── */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-subtle shrink-0">
              <span className="font-mono text-sm text-t2">
                Cornell Tech Hub
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center h-7 w-7 text-t3 hover:text-t1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Scrollable content ── */}
            <motion.div
              className="overflow-y-auto flex-1 scrollbar-none"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* ── Primary nav grid ── */}
              <nav className="grid grid-cols-4 gap-0 border-b border-subtle">
                {routes.map((route) => (
                  <motion.div key={route.href} variants={navGridVariants}>
                    <Link
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-4 text-[11px] font-mono transition-colors",
                        route.active
                          ? "text-t1 bg-surface-active"
                          : "text-t3 hover:text-t1 hover:bg-surface-hover",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      {route.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {session ? (
                <>
                  {/* ── Account links ── */}
                  <div className="py-2 border-b border-subtle">
                    {accountLinks.map((link) => (
                      <motion.div key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 font-mono text-[13px] text-t2 hover:text-t1 hover:bg-surface-hover transition-colors"
                        >
                          <link.icon className="h-4 w-4 text-t3" />
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* ── Theme toggle + Sign out ── */}
                  <div className="py-2">
                    <motion.div variants={itemVariants}>
                      <button
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="flex items-center gap-3 px-5 py-2.5 w-full font-mono text-[13px] text-t2 hover:text-t1 hover:bg-surface-hover transition-colors"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4 text-t3" />
                        ) : (
                          <Moon className="h-4 w-4 text-t3" />
                        )}
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                      </button>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <button
                        onClick={() => {
                          setOpen(false);
                          signOut();
                        }}
                        className="flex items-center gap-3 px-5 py-2.5 w-full font-mono text-[13px] text-red-500 hover:text-red-400 hover:bg-surface-hover transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="p-5 flex flex-col gap-2">
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="flex items-center gap-3 px-3 py-2.5 w-full font-mono text-[13px] text-t2 hover:text-t1 hover:bg-surface-hover transition-colors"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4 text-t3" />
                      ) : (
                        <Moon className="h-4 w-4 text-t3" />
                      )}
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-center font-mono text-[13px]"
                    >
                      <Link href="/auth/signin" onClick={() => setOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button
                      asChild
                      className="w-full justify-center font-mono text-[13px] bg-cta text-cta hover:bg-cta-hover"
                    >
                      <Link href="/auth/signup" onClick={() => setOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Safe area spacing for devices with home indicator */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-8 w-8" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
