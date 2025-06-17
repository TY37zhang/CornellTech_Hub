import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
// see https://pris.ly/d/help/next-js-best-practices

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma =
    globalThis.prisma ||
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "info", "warn", "error"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}

export default prisma;
