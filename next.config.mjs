import createBundleAnalyzer from "@next/bundle-analyzer";

// Wrap the base config with the bundle-analyzer plugin. It will only
// activate when `ANALYZE=true` is passed to the build command.
const withBundleAnalyzer = createBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

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
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "plus.unsplash.com",
            },
        ],
        unoptimized: false,
        formats: ["image/avif", "image/webp"],
    },
    serverExternalPackages: ["@neondatabase/serverless"],
    // No custom webpack alias to avoid runtime issues with components that
    // import `motion` server-side. We rely on modularizeImports to reduce the
    // client bundle instead.
    experimental: {},
    turbopack: {
        resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
};

export default withBundleAnalyzer(nextConfig);
