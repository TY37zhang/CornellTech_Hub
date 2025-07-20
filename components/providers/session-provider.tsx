"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider
            // Refetch session every 5 minutes instead of default 0 (never)
            refetchInterval={5 * 60}
            // Don't refetch on window focus to reduce unnecessary requests
            refetchOnWindowFocus={false}
            // Reduce refetch interval when window regains focus
            refetchWhenOffline={false}
        >
            {children}
        </SessionProvider>
    );
}
