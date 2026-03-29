"use client";

import Link from "next/link";
import {
  BookOpen,
  Home,
  MessageSquare,
  Settings,
  LogOut,
  FileText,
  BookmarkPlus,
  Calendar,
  MessageCircle,
  Shield,
  UserCog,
  Sun,
  Moon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
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
import { isAdmin, isMod } from "@/lib/roles";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/planner", label: "Planner", icon: Calendar },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-4 px-4"
    >
      <div className="pointer-events-auto flex h-11 items-center gap-1 border border-island bg-island backdrop-blur-xl px-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_8px_40px_-12px_rgba(0,0,0,0.8)]">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-0 px-2.5 py-1.5 font-mono text-[13px] text-t2 hover:text-t1 transition-colors shrink-0"
        >
          <span className="text-red-500 font-bold">[</span>
          <span className="mx-0.5">CTH</span>
          <span className="text-red-500 font-bold">]</span>
        </Link>

        {/* ── Separator ── */}
        <div className="hidden md:block h-4 w-px bg-border mx-0.5" />

        {/* ── Nav items (desktop) ── */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-mono transition-colors",
                  isActive ? "text-t1" : "text-t3 hover:text-t1",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 bg-surface-active"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Separator ── */}
        <div className="hidden md:block h-4 w-px bg-border mx-0.5" />

        {/* ── Auth area (desktop) ── */}
        <div className="hidden md:flex items-center gap-1">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex h-6 w-6 items-center justify-center outline-none">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || ""}
                    />
                    <AvatarFallback className="text-[9px] text-t3 bg-surface-active border border-strong">
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-56 bg-surface border-strong shadow-[0_8px_40px_-12px_rgba(0,0,0,0.8)]"
              >
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-mono text-[13px] text-t1">
                      {session.user?.name}
                    </p>
                    <p className="font-mono text-[11px] text-t4">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                {isAdmin(session.user) && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                    >
                      <UserCog className="mr-2 h-3.5 w-3.5" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                {isMod(session.user) && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/moderation"
                      className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                    >
                      <Shield className="mr-2 h-3.5 w-3.5" />
                      Moderation
                    </Link>
                  </DropdownMenuItem>
                )}
                {(isAdmin(session.user) || isMod(session.user)) && (
                  <DropdownMenuSeparator className="bg-border" />
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href="/user/posts"
                    className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    My Posts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/forum/saved"
                    className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                  >
                    <BookmarkPlus className="mr-2 h-3.5 w-3.5" />
                    Saved Posts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-reviews"
                    className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    My Reviews
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                  >
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/feedback"
                    className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                  >
                    <MessageCircle className="mr-2 h-3.5 w-3.5" />
                    Feedback
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs"
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-3.5 w-3.5" />
                  ) : (
                    <Moon className="mr-2 h-3.5 w-3.5" />
                  )}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center cursor-pointer text-red-500 focus:text-red-400 font-mono text-xs"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center h-7 w-7 text-t3 hover:text-t1 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
              <div className="h-4 w-px bg-border mx-0.5" />
              <Link
                href="/auth/signin"
                className="px-2.5 py-1 font-mono text-[13px] text-t3 hover:text-t1 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-1 font-mono text-[13px] bg-cta text-cta hover:bg-cta-hover transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile menu trigger ── */}
        <div className="md:hidden flex items-center ml-0.5">
          <MobileNav />
        </div>
      </div>
    </motion.header>
  );
}
