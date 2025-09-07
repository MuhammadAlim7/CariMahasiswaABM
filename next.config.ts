import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   webpack(config) {
      config.module.rules.push({
         test: /\.svg$/,
         issuer: /\.[jt]sx?$/,
         use: ["@svgr/webpack"],
      });
      return config;
   },
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "scan.stie-mce.ac.id",
            pathname: "/photo/**",
         },
      ],
   },
   logging: {
      fetches: {
         fullUrl: true,
      },
   },
};

export default nextConfig;
