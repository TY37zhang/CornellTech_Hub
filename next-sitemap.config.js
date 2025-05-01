/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://www.cornelltechhub.info",
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
            },
        ],
    },
    exclude: ["/auth/*", "/api/*"],
    changefreq: "daily",
    priority: 0.7,
    sitemapSize: 7000,
};
