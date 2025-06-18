/* eslint-disable @next/next/no-async-client-component */
import ForumClient from "./ForumClient";
import { getForumPosts, getForumStats, getTopContributors } from "./actions";

export const revalidate = 600; // regenerate every 10 minutes

export default async function ForumPageWrapper() {
    const threadsPerPage = 10;

    // Fetch posts, stats and contributors on the server so they are included in the first paint
    const [{ posts, total }, forumStats, topContributors] = await Promise.all([
        getForumPosts("", threadsPerPage, 0),
        getForumStats(),
        getTopContributors(),
    ]);

    return (
        <ForumClient
            initialPosts={posts}
            initialStats={forumStats}
            initialContributors={topContributors}
            initialTotalPages={Math.ceil(total / threadsPerPage)}
        />
    );
}
