"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
    children: ReactNode;
    className?: string;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function AnimatedList({ children, className = "" }: AnimatedListProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedListItem({
    children,
    className = "",
}: AnimatedListProps) {
    return (
        <motion.div variants={item} className={className}>
            {children}
        </motion.div>
    );
}
