"use client";

import { motion } from "framer-motion";

export const LoadingSpinner = () => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
    />
);

export const LoadingPage = () => (
    <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
    </div>
);
