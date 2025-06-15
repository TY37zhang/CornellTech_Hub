import { useState } from "react";
import { Copy, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SearchResult } from "@/lib/services/SearchService";
import ReactMarkdown from "react-markdown";

interface AssistantMessageProps {
    content: string;
    timestamp: string;
    typing?: boolean;
    error?: boolean;
    sources?: string[];
    searchResults?: SearchResult[];
}

export function AssistantMessage({
    content,
    timestamp,
    typing,
    error,
    sources,
    searchResults,
}: AssistantMessageProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div className="flex justify-start group w-full">
            <div
                className={`relative max-w-[80%] rounded-lg p-3 mr-4 bg-muted shadow-md transition-all flex items-start ${error ? "border border-destructive" : ""}`}
                tabIndex={0}
                aria-label="Assistant message"
            >
                <div className="flex flex-col w-full">
                    <div className="flex flex-row items-start w-full">
                        <div className="text-sm break-words whitespace-pre-wrap flex-1">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="ml-2 p-1 rounded hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-muted mt-[-4px]"
                            aria-label="Copy message"
                        >
                            {copied ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchResults && searchResults.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-muted-foreground/20">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                                Sources from web search:
                            </h4>
                            <div className="space-y-3">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="text-xs bg-background/50 rounded p-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <a
                                                href={result.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                {result.title}
                                            </a>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                        <div className="text-muted-foreground mt-1">
                                            {result.source}
                                        </div>
                                        <p className="text-muted-foreground mt-1">
                                            {result.snippet}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sources */}
                    {sources && sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-muted-foreground/20">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                                Sources:
                            </h4>
                            <div className="space-y-1">
                                {sources.map((source, index) => (
                                    <div
                                        key={index}
                                        className="text-xs text-muted-foreground"
                                    >
                                        {source}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Timestamp on hover */}
                <span className="absolute -bottom-6 left-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity select-none">
                    {timestamp}
                </span>

                {/* Error state */}
                {error && (
                    <div className="flex items-center gap-1 mt-2 text-destructive text-xs">
                        <AlertCircle className="h-4 w-4" /> Failed to send
                    </div>
                )}

                {/* Typing indicator */}
                {typing && (
                    <div className="flex items-center gap-1 mt-2 text-muted-foreground text-xs">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                        />
                        <span>Typing...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
