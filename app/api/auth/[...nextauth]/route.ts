import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            program?: string | null;
        };
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
