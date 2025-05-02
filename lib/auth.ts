import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";
import { DefaultSession } from "next-auth";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

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
                    const result = await sql`
                        SELECT * FROM users WHERE email = ${user.email}
                    `;

                    // If user doesn't exist, create them
                    if (result.length === 0) {
                        console.log(
                            "Creating new user with Cornell email:",
                            user.email
                        );
                        const newUser = await sql`
                            INSERT INTO users (name, email, avatar_url, program)
                            VALUES (${user.name}, ${user.email}, ${DEFAULT_PROFILE_PICTURE}, NULL)
                            RETURNING id, name, email, avatar_url, program
                        `;
                        console.log("New user created:", newUser[0]);

                        // Update the user object with the new user's ID and avatar
                        user.id = newUser[0].id;
                        user.image = newUser[0].avatar_url;
                    } else {
                        // Update the user object with the existing user's data
                        console.log("Found existing user:", result[0]);
                        user.id = result[0].id;
                        user.name = result[0].name;
                        // Use the avatar_url from our database
                        user.image =
                            result[0].avatar_url || DEFAULT_PROFILE_PICTURE;
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
                const result = await sql`
                    SELECT name, avatar_url, program FROM users WHERE id = ${token.id}
                `;

                if (!result || result.length === 0) {
                    return session;
                }

                if (result.length > 0) {
                    session.user.name = result[0].name;
                    session.user.program = result[0].program;

                    // Always use the avatar_url from the database
                    if (result[0].avatar_url) {
                        session.user.image = result[0].avatar_url;
                    } else {
                        session.user.image = DEFAULT_PROFILE_PICTURE;
                    }
                }
            }
            return session;
        },
    },
};
