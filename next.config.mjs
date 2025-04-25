/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: [
            "images.unsplash.com",
            "plus.unsplash.com",
            "placeholder.svg",
        ],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
        unoptimized: true,
    },
    serverExternalPackages: ["@neondatabase/serverless"],
    experimental: {},
};

export default nextConfig;
