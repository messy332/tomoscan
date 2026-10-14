/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "idgfyltfatwbmtatbwqf.supabase.co", // Supabase Storage
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
