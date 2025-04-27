import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a date string or Date object into a human-readable format
 * @param date - The date to format (string or Date object)
 * @returns A formatted date string
 */
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
        return "Invalid date";
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    // If less than a minute ago
    if (diffMinutes < 1) {
        return "Just now";
    }

    // If less than an hour ago
    if (diffHours < 1) {
        return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    }

    // If less than a day ago
    if (diffDays < 1) {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }

    // If less than a week ago
    if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }

    // If less than a month ago
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }

    // If less than a year ago
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    // If more than a year ago
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
}
