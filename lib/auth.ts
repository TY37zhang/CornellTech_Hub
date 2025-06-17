import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";
import { DefaultSession } from "next-auth";

// Default profile picture URL
const DEFAULT_PROFILE_PICTURE =
    "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

// Extend the session type to include our custom fields
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            program: string | null;
        } & DefaultSession["user"];
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email || !user.name) {
                return false;
            }

            // Only allow Cornell email addresses
            if (user.email && !user.email.endsWith("@cornell.edu")) {
                console.log(
                    "Access denied: Non-Cornell email attempted to sign in",
                    user.email
                );
                return false;
            }

            // If using Google provider, check if user exists in our database
            if (account?.provider === "google") {
                try {
                    const existing = await prisma.users.findUnique({
                        where: { email: user.email },
                    });

                    if (!existing) {
                        console.log(
                            "Creating new user with Cornell email:",
                            user.email
                        );
                        const newUser = await prisma.users.create({
                            data: {
                                name: user.name!,
                                email: user.email,
                                avatar_url: DEFAULT_PROFILE_PICTURE,
                            },
                        });
                        user.id = newUser.id;
                        user.image =
                            newUser.avatar_url || DEFAULT_PROFILE_PICTURE;
                    } else {
                        user.id = existing.id;
                        user.name = existing.name;
                        user.image =
                            existing.avatar_url || DEFAULT_PROFILE_PICTURE;
                    }
                } catch (error) {
                    console.error("Error during Google sign in:", error);
                    throw new Error(
                        "Failed to process Google sign in. Please try again."
                    );
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;

                // Get the latest user data from database
                const dbUser = await prisma.users.findUnique({
                    where: { id: token.id as string },
                    select: { name: true, avatar_url: true, program: true },
                });

                if (!dbUser) {
                    return session;
                }

                session.user.name = dbUser.name;
                session.user.program = dbUser.program;
                session.user.image =
                    dbUser.avatar_url || DEFAULT_PROFILE_PICTURE;
            }
            return session;
        },
    },
};
