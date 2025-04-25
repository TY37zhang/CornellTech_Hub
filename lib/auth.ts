import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

// Default profile picture URL
const DEFAULT_PROFILE_PICTURE =
    "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

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
            console.log("Sign in attempt:", {
                email: user.email,
                name: user.name,
                provider: account?.provider,
            });

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
                    console.log("Checking if user exists in database");
                    const result = await sql`
                        SELECT * FROM users WHERE email = ${user.email}
                    `;
                    console.log("Database query result:", result);

                    // Use default profile picture if user doesn't have one
                    const avatarUrl = user.image || DEFAULT_PROFILE_PICTURE;

                    // If user doesn't exist, create them
                    if (result.length === 0) {
                        console.log(
                            "Creating new user with Cornell email:",
                            user.email
                        );
                        const newUser = await sql`
                            INSERT INTO users (name, email, avatar_url)
                            VALUES (${user.name}, ${user.email}, ${avatarUrl})
                            RETURNING id, name, email, avatar_url
                        `;
                        console.log("New user created:", newUser[0]);

                        // Update the user object with the new user's ID
                        user.id = newUser[0].id;
                    } else {
                        // Update the user object with the existing user's ID
                        console.log("Found existing user:", result[0]);
                        user.id = result[0].id;

                        // Only update the avatar_url if it's null or different
                        if (
                            !result[0].avatar_url ||
                            avatarUrl !== result[0].avatar_url
                        ) {
                            await sql`
                                UPDATE users 
                                SET avatar_url = ${avatarUrl},
                                    updated_at = NOW()
                                WHERE id = ${result[0].id}
                            `;
                            console.log(
                                "Updated user's avatar_url to:",
                                avatarUrl
                            );
                        }

                        // Keep the user's chosen display name
                        user.name = result[0].name;
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
                    SELECT name, avatar_url FROM users WHERE id = ${token.id}
                `;
                if (result.length > 0) {
                    session.user.name = result[0].name;
                    session.user.image =
                        result[0].avatar_url || DEFAULT_PROFILE_PICTURE;
                }
            }
            return session;
        },
    },
};
