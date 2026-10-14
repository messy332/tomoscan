/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "idgfyltfatwbmtatbwqf.supabase.co", // Supabase Storage
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "https://tomoscan-v6ba.vercel.app";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
