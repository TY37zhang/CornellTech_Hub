/* eslint-disable @next/next/no-async-client-component */
import ForumClient from "./ForumClient";

export const revalidate = 600; // regenerate every 10 minutes

export default async function ForumPageWrapper() {
    return <ForumClient />;
}
