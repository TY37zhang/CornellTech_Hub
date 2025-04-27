"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
    scale?: number;
    y?: number;
    duration?: number;
    delay?: number;
    children: React.ReactNode;
}

export function AnimatedCard({
    className,
    hoverEffect = true,
    scale = 1.02,
    y = -5,
    duration = 0.2,
    delay = 0,
    children,
    ...props
}: AnimatedCardProps) {
    if (hoverEffect) {
        return (
            <motion.div
                className={cn(
                    "rounded-lg border bg-card text-card-foreground shadow-sm",
                    className
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay }}
                whileHover={{
                    y,
                    scale,
                    boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    borderColor: "transparent",
                    transition: { duration },
                }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <motion.div
            className={cn(
                "rounded-lg border bg-card text-card-foreground shadow-sm",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedCardList({
    children,
    className,
    staggerDelay = 0.1,
}: {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}) {
    return (
        <motion.div
            className={cn("grid gap-4", className)}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
        >
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        delay: index * staggerDelay,
                    } as any);
                }
                return child;
            })}
        </motion.div>
    );
}
