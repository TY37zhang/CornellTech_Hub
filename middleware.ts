import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/courses/new-review",
        "/courses/[slug]/new-review",
        // Add other protected routes here
    ],
};
