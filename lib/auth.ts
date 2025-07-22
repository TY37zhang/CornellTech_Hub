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
            role: string;
            is_admin: boolean;
            is_mod: boolean;
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
    useSecureCookies: process.env.NODE_ENV === "production",
    cookies: {
        csrfToken: {
            name: process.env.NODE_ENV === "production" 
                ? "__Host-next-auth.csrf-token" 
                : "next-auth.csrf-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        sessionToken: {
            name: process.env.NODE_ENV === "production" 
                ? "__Secure-next-auth.session-token" 
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email || !user.name) {
                return false;
            }

            // Only allow Cornell email addresses
            if (user.email && !user.email.endsWith("@cornell.edu")) {
                return false;
            }

            // If using Google provider, check if user exists in our database
            if (account?.provider === "google") {
                try {
                    const existing = await prisma.users.findUnique({
                        where: { email: user.email },
                    });

                    if (!existing) {
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
            
            // Fetch user role and elevation flags for middleware access
            if (token.id) {
                try {
                    const dbUser = await prisma.users.findUnique({
                        where: { id: token.id as string },
                        select: { role: true, is_admin: true, is_mod: true },
                    });
                    
                    if (dbUser) {
                        token.role = dbUser.role || 'student';
                        token.is_admin = dbUser.is_admin || false;
                        token.is_mod = dbUser.is_mod || false;
                    }
                } catch (error) {
                    console.error('Error fetching user data in JWT callback:', error);
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;

                // Get the latest user data from database
                try {
                    const dbUser = await prisma.users.findUnique({
                        where: { id: token.id as string },
                        select: { name: true, avatar_url: true, program: true, role: true, is_admin: true, is_mod: true },
                    });

                    if (!dbUser) {
                        return session;
                    }

                    session.user.name = dbUser.name;
                    session.user.program = dbUser.program;
                    session.user.role = dbUser.role || 'student';
                    session.user.is_admin = dbUser.is_admin || false;
                    session.user.is_mod = dbUser.is_mod || false;
                    session.user.image =
                        dbUser.avatar_url || DEFAULT_PROFILE_PICTURE;
                } catch (error) {
                    console.error('Error fetching user data in session:', error);
                    // Fallback to token data or defaults
                    session.user.role = (token.role as string) || 'student';
                    session.user.is_admin = (token.is_admin as boolean) || false;
                    session.user.is_mod = (token.is_mod as boolean) || false;
                }
            }
            return session;
        },
    },
};
