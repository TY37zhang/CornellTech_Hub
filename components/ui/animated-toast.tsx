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
          background: "black",
          color: "rgb(229 229 229)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
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
    className="bg-black text-neutral-200 border border-white/[0.08] rounded-none p-4"
    {...props}
  >
    {children}
  </motion.div>
);
