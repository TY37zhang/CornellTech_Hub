import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

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

                    // If user doesn't exist, create them
                    if (result.length === 0) {
                        console.log(
                            "Creating new user with Cornell email:",
                            user.email
                        );
                        const newUser = await sql`
                            INSERT INTO users (name, email, avatar_url)
                            VALUES (${user.name}, ${user.email}, ${user.image})
                            RETURNING id, name, email, avatar_url
                        `;
                        console.log("New user created:", newUser[0]);

                        // Update the user object with the new user's ID
                        user.id = newUser[0].id;
                    } else {
                        // Update the user object with the existing user's ID
                        console.log("Found existing user:", result[0]);
                        user.id = result[0].id;
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
            }
            return session;
        },
    },
};
