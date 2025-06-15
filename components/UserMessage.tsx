import { useState } from "react";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";

interface UserMessageProps {
    content: string;
    timestamp: string;
    error?: boolean;
}

export function UserMessage({ content, timestamp, error }: UserMessageProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div className="flex justify-end group w-full">
            <div
                className={`relative max-w-[80%] rounded-lg p-3 ml-4 bg-primary text-primary-foreground shadow-md transition-all flex items-start ${error ? "border border-destructive" : ""}`}
                tabIndex={0}
                aria-label="User message"
            >
                <div className="flex flex-row items-start w-full">
                    <div className="text-sm break-words whitespace-pre-wrap flex-1">
                        {content}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="ml-2 p-1 rounded hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary mt-[-4px]"
                        aria-label="Copy message"
                    >
                        {copied ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {/* Timestamp on hover */}
                <span className="absolute -bottom-6 right-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity select-none">
                    {timestamp}
                </span>
                {/* Error state */}
                {error && (
                    <div className="flex items-center gap-1 mt-2 text-destructive text-xs">
                        <AlertCircle className="h-4 w-4" /> Failed to send
                    </div>
                )}
            </div>
        </div>
    );
}
