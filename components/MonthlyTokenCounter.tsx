import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MonthlyTokenCounterProps {
    used: number;
    max: number;
    resetAt: Date;
}

export function MonthlyTokenCounter({
    used,
    max,
    resetAt,
}: MonthlyTokenCounterProps) {
    const percent = Math.min((used / max) * 100, 100);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const diff = resetAt.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft("Resets soon");
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            setTimeLeft(`Resets in ${days}d ${hours}h`);
        };
        update();
        const interval = setInterval(update, 1000 * 30);
        return () => clearInterval(interval);
    }, [resetAt]);

    let barColor = "bg-primary";
    let textColor = "text-primary";
    let warning = "";
    if (percent >= 95) {
        barColor = "bg-destructive";
        textColor = "text-destructive";
        warning = "Almost out!";
    } else if (percent >= 80) {
        barColor = "bg-yellow-400";
        textColor = "text-yellow-600";
        warning = "Running low";
    }

    return (
        <div className="w-full flex flex-col gap-2 py-2 px-4 bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-2 w-full justify-between">
                <span className={`text-xs font-medium ${textColor}`}>
                    {used.toLocaleString()} of {max.toLocaleString()} this month
                </span>
                <AnimatePresence>
                    {warning && (
                        <motion.span
                            key={warning}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs font-semibold animate-pulse"
                        >
                            {warning}
                        </motion.span>
                    )}
                </AnimatePresence>
                <span className="text-xs text-muted-foreground">
                    {timeLeft}
                </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className={`h-2 rounded-full ${barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 24 }}
                />
            </div>
        </div>
    );
}

// Helper to get the next NYC midnight (first of next month)
export function getNextMonthNYCMidnight(): Date {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // NYC is UTC-5 or UTC-4 (DST), so use 05:00 UTC for EST, 04:00 UTC for EDT
    // We'll use 05:00 UTC for safety (worst case, it's off by 1 hour during DST)
    // For robust handling, use a timezone library in production
    return new Date(Date.UTC(year, month + 1, 1, 4, 0, 0)); // 00:00 NYC = 04:00 UTC (EDT)
}
