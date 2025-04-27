import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import AuthProvider from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

interface RootLayoutProps {
    children: React.ReactNode;
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

export const metadata = {
    title: "Cornell Tech Hub",
    description: "A community for Cornell Tech students",
    generator: "v0.dev",
    icons: {
        icon: "/images/logo/cornell-tech.svg",
    },
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link
                    rel="icon"
                    href="/images/logo/cornell-tech.svg"
                    type="image/svg+xml"
                />
            </head>
            <body className={inter.className} suppressHydrationWarning={true}>
                <AuthProvider>
                    <div className="relative flex min-h-screen flex-col">
                        <SiteHeader />
                        <div className="flex-1">{children}</div>
                        <Footer />
                    </div>
                    <Toaster />
                    <Analytics />
                    <SpeedInsights />
                </AuthProvider>
            </body>
        </html>
    );
}
