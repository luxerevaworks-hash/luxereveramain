/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      ...["/images/:path*", "/videos/:path*", "/fonts/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      })),
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "static.wixstatic.com" },
    ],
  },
};

module.exports = nextConfig;
