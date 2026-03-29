"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Toaster as SonnerToaster } from "sonner";

export function AnimatedToaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: "toast",
        duration: 5000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0",
          boxShadow: "none",
        },
      }}
    />
  );
}

export const Toast = ({ children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="bg-background text-foreground border border-border rounded-none p-4"
    {...props}
  >
    {children}
  </motion.div>
);
