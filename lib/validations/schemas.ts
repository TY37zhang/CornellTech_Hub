import { z } from "zod";

// Common validation patterns
export const emailSchema = z
    .string()
    .email("Please enter a valid email address");
export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

// User related schemas
export const userProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailSchema,
    program: z.string().min(2, "Please select a program"),
    avatar_url: z.string().url().optional(),
});

// Course review schemas
export const courseReviewSchema = z.object({
    title: z.string().min(1, "Title is required"),
    professor: z.string().min(1, "Professor is required"),
    category: z.string(),
    difficulty: z.number().min(1).max(5),
    workload: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
    overall_rating: z.number().min(1).max(5),
    review: z.string().min(10, "Review must be at least 10 characters"),
    courseId: z.string().min(1, "Course ID is required"),
    grade: z.string().nullable().optional(),
});

// Feedback schemas
export const feedbackSchema = z.object({
    type: z.enum(["feedback", "bug"]),
    message: z
        .string()
        .min(10, "Please provide more details (minimum 10 characters)"),
});

// Marketplace schemas
export const marketplaceItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    price: z.number().min(0, "Price must be a positive number"),
    category: z.string().min(1, "Category is required"),
    condition: z.string().min(1, "Condition is required"),
    image_url: z.string().url().optional(),
});

// File upload schemas
export const imageUploadSchema = z.object({
    file: z
        .instanceof(File)
        .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            "File size must be less than 5MB"
        )
        .refine(
            (file) => file.type.startsWith("image/"),
            "File must be an image"
        ),
});

// Export all schemas
export const schemas = {
    user: {
        profile: userProfileSchema,
    },
    course: {
        review: courseReviewSchema,
    },
    feedback: feedbackSchema,
    marketplace: {
        item: marketplaceItemSchema,
    },
    file: {
        image: imageUploadSchema,
    },
};
