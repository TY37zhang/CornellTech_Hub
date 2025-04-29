import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}

/**
 * Format a date string or Date object into a human-readable format
 * @param date - The date to format (string or Date object)
 * @returns A formatted date string
 */
export function formatDate(date: string | Date | null | undefined): string {
    if (!date) {
        return "No date";
    }

    let dateObj: Date;

    // If it's already a Date object
    if (date instanceof Date) {
        dateObj = date;
    } else {
        // Parse the string date
        dateObj = new Date(date);
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
        return "Invalid date";
    }

    // Format the date
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).format(dateObj);
}

export function formatDateShort(
    date: string | Date | null | undefined
): string {
    if (!date) {
        return "No date";
    }

    let dateObj: Date;

    // If it's already a Date object
    if (date instanceof Date) {
        dateObj = date;
    } else {
        // Parse the string date
        dateObj = new Date(date);
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
        return "Invalid date";
    }

    // Format the date
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(dateObj);
}

export function isValidDate(date: string | Date | null | undefined): boolean {
    if (!date) {
        return false;
    }

    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
}
