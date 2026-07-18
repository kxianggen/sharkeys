import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Community build photos are served from the public Supabase Storage bucket
    // (build-post-images). Allow next/image to optimize those URLs.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
