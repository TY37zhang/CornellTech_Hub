import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import AuthProvider from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

interface RootLayoutProps {
    children: React.ReactNode;
}

export const metadata = {
    title: "Cornell Tech Hub",
    description: "A community for Cornell Tech students",
    generator: "v0.dev",
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <div className="relative flex min-h-screen flex-col">
                        <SiteHeader />
                        <div className="flex-1">{children}</div>
                    </div>
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}
