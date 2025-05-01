import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://www.cornelltechhub.info",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: "https://www.cornelltechhub.info/courses",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: "https://www.cornelltechhub.info/forum",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: "https://www.cornelltechhub.info/planner",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: "https://www.cornelltechhub.info/settings",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.5,
        },
    ];
}
