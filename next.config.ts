import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const staticAssetCache = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [256, 384, 520],
  },
  experimental: {
    optimizePackageImports: ["clsx", "tailwind-merge", "zod"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/images/:path*",
        headers: staticAssetCache,
      },
      {
        source: "/:path*.jpg",
        headers: staticAssetCache,
      },
      {
        source: "/:path*.png",
        headers: staticAssetCache,
      },
      {
        source: "/:path*.webp",
        headers: staticAssetCache,
      },
      {
        source: "/:path*.avif",
        headers: staticAssetCache,
      },
      {
        source: "/favicon.ico",
        headers: staticAssetCache,
      },
      {
        source: "/og-image.jpg",
        headers: staticAssetCache,
      },
    ];
  },
};

export default nextConfig;
