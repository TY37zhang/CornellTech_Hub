/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://www.cornelltechhub.info",
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/*",
                    "/auth/*",
                    "/settings",
                    "/_next/*",
                    "/*.json",
                ],
            },
        ],
        additionalSitemaps: ["https://www.cornelltechhub.info/sitemap.xml"],
    },
    exclude: ["/auth/*", "/api/*", "/settings", "/_next/*"],
    changefreq: "daily",
    priority: 0.7,
    sitemapSize: 7000,
};
