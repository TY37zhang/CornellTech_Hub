"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { ChatModal } from "./ChatModal";

export function FloatingChatButton() {
    const { data: session, status } = useSession();
    const [isHovered, setIsHovered] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    if (status === "loading" || !session) {
        return null;
    }

    return (
        <>
            <AnimatePresence>
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                    <motion.div
                        animate={{
                            scale: isHovered ? 1.1 : 1,
                            rotate: isHovered ? 5 : 0,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                        }}
                    >
                        <MessageCircle className="h-6 w-6" />
                    </motion.div>
                    <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                        animate={{
                            scale: isHovered ? 1.2 : 1,
                            opacity: isHovered ? 0.8 : 0.4,
                        }}
                        transition={{ duration: 0.2 }}
                    />
                </motion.button>
            </AnimatePresence>

            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </>
    );
}
