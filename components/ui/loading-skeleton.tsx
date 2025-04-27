"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: string;
    height?: string;
}

export function Skeleton({
    className,
    width,
    height,
    ...props
}: SkeletonProps) {
    return (
        <motion.div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            style={{ width, height }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
            }}
            {...props}
        />
    );
}

export function ForumPostSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>
        </div>
    );
}

export function ForumPostListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <ForumPostSkeleton key={i} />
            ))}
        </div>
    );
}
