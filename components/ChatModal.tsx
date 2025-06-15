"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { ChatInterface } from "./ChatInterface";
import {
    MonthlyTokenCounter,
    getNextMonthNYCMidnight,
} from "./MonthlyTokenCounter";

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
    const { data: session, status } = useSession();
    const [tokenUsage, setTokenUsage] = useState({ used: 0, max: 0 });

    // Fetch token usage
    const fetchTokenUsage = async () => {
        try {
            const res = await fetch("/api/tokens");
            if (res.ok) {
                const data = await res.json();
                setTokenUsage(data);
            }
        } catch (error) {
            console.error("Error fetching token usage:", error);
        }
    };

    // Fetch token usage on mount and when chat is opened
    useEffect(() => {
        if (isOpen) {
            fetchTokenUsage();
        }
    }, [isOpen]);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    // Don't render if not authenticated
    if (status === "loading" || !session) {
        return null;
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="fixed bottom-24 left-6 z-50 w-[400px] rounded-lg border bg-background shadow-lg md:bottom-6 md:left-6 md:w-[500px] flex flex-col h-[600px]"
                            >
                                <div className="flex items-center justify-between border-b p-4">
                                    <Dialog.Title className="text-lg font-semibold">
                                        Chat Support
                                    </Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button
                                            className="rounded-full p-1 hover:bg-muted"
                                            aria-label="Close chat"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </Dialog.Close>
                                </div>
                                <MonthlyTokenCounter
                                    used={tokenUsage.used}
                                    max={tokenUsage.max}
                                    resetAt={getNextMonthNYCMidnight()}
                                />
                                <div className="flex-1 overflow-hidden">
                                    <ChatInterface
                                        onTokenUpdate={fetchTokenUsage}
                                    />
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
