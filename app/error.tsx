"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="flex h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Something went wrong</h2>
                    <button
                        className="px-4 py-2 rounded bg-primary text-primary-foreground"
                        onClick={() => reset()}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
