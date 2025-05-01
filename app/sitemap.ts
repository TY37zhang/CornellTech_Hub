import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://www.cornelltechhub.info"; 

    // Define your static routes
    const staticRoutes = [
        "",
        "/courses",
        "/forum",
        "/planner",
        "/settings",
        "/auth/signin",
        "/auth/signup",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    return staticRoutes;
}
