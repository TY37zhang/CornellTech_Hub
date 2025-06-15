"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { SearchResult } from "@/lib/services/SearchService";

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    error?: boolean;
    typing?: boolean;
    sources?: string[];
    searchResults?: SearchResult[];
}

interface ChatInterfaceProps {
    onTokenUpdate?: () => void;
}

export function ChatInterface({ onTokenUpdate }: ChatInterfaceProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const MAX_CHARS = 500;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [inputMessage]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        };

        const textarea = inputRef.current;
        if (textarea) {
            textarea.addEventListener("keydown", handleKeyPress);
        }

        return () => {
            if (textarea) {
                textarea.removeEventListener("keydown", handleKeyPress);
            }
        };
    }, [inputMessage]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: inputMessage.trim(),
            role: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputMessage("");
        setIsTyping(true);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: newMessage.content,
                    conversation_id: conversationId,
                }),
            });
            if (!res.ok) {
                throw new Error("Failed to get assistant response");
            }
            const data = await res.json();
            setConversationId(data.conversation_id);
            setIsTyping(false);
            setIsLoading(false);
            if (data.assistantMessage) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: data.assistantMessage.id,
                        content: data.assistantMessage.content,
                        role: "assistant",
                        timestamp: new Date(data.assistantMessage.created_at),
                        error: data.assistantMessage.error,
                        sources: [],
                        searchResults: data.searchResults || [],
                    },
                ]);
                // Update token usage after successful message
                onTokenUpdate?.();
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);
            setIsLoading(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "-err",
                    content:
                        "Sorry, there was an error getting a response. Please try again.",
                    role: "assistant",
                    timestamp: new Date(),
                    error: true,
                },
            ]);
        }
    };

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(date);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) =>
                        message.role === "user" ? (
                            <UserMessage
                                key={message.id}
                                content={message.content}
                                timestamp={formatTimestamp(message.timestamp)}
                                error={message.error}
                            />
                        ) : (
                            <AssistantMessage
                                key={message.id}
                                content={message.content}
                                timestamp={formatTimestamp(message.timestamp)}
                                typing={message.typing}
                                error={message.error}
                                sources={message.sources}
                            />
                        )
                    )}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <AssistantMessage
                        content={""}
                        timestamp={""}
                        typing={true}
                    />
                )}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-3">
                <form
                    className="flex items-end gap-0.5"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    role="search"
                    aria-label="Chat message input area"
                >
                    <Textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) =>
                            setInputMessage(e.target.value.slice(0, MAX_CHARS))
                        }
                        placeholder="Type your message..."
                        className="resize-none min-h-[40px] max-h-[120px] text-base leading-tight py-2 px-3 flex-1 border-input focus-visible:ring-2 focus-visible:ring-primary/50"
                        rows={1}
                        aria-label="Message input"
                        style={{ height: "40px", overflow: "hidden" }}
                    />
                    <div className="flex flex-col items-end gap-1 min-w-[60px]">
                        <span className="text-xs text-muted-foreground mb-1 select-none">
                            {inputMessage.length}/{MAX_CHARS}
                        </span>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputMessage.trim() || isLoading}
                            aria-label="Send message"
                            className="rounded-full h-10 w-10"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
