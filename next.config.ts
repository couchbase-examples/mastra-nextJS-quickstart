import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["couchbase", "pdf-parse"]
};

export default nextConfig;
