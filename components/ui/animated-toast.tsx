"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Toaster as SonnerToaster } from "sonner";

export function AnimatedToaster() {
    return (
        <SonnerToaster
            position="top-right"
            toastOptions={{
                className: "toast",
                duration: 5000,
                style: {
                    background: "var(--background)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                },
            }}
        />
    );
}

export const Toast = ({ children, ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        {...props}
    >
        {children}
    </motion.div>
);
