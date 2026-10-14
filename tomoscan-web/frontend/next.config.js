/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "idgfyltfatwbmtatbwqf.supabase.co", // Supabase Storage
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL && process.env.BACKEND_URL !== "undefined"
      ? process.env.BACKEND_URL
      : null;

    if (!backendUrl) return [];

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
