import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow iframe embedding from any origin
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          // Allow camera in iframes
          {
            key: "Permissions-Policy",
            value: "camera=(*)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
