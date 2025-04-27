"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimationProviderProps {
    children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
