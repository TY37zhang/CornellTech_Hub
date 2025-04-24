/** @type {import('next').NextConfig} */
import MiniCssExtractPlugin from "mini-css-extract-plugin";

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
    webpack: (config, { isServer }) => {
        config.plugins.push(new MiniCssExtractPlugin());
        return config;
    },
};

export default nextConfig;
