import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL || "");

const handler = NextAuth({
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
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter an email and password");
                }

                const result = await sql`
          SELECT * FROM users WHERE email = ${credentials.email}
        `;

                const user = result[0];

                if (!user) {
                    throw new Error("No user found with this email");
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!passwordMatch) {
                    throw new Error("Incorrect password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
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
            // Only allow Cornell email addresses
            if (user.email && !user.email.endsWith("@cornell.edu")) {
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
                        await sql`
                            INSERT INTO users (name, email, google_id)
                            VALUES (${user.name}, ${user.email}, ${profile?.sub})
                        `;
                    }
                } catch (error) {
                    console.error("Error during Google sign in:", error);
                    return false;
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
});

export { handler as GET, handler as POST };
