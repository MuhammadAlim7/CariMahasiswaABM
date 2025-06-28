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
      domains: ["scan.stie-mce.ac.id"],
      remotePatterns: [
         {
            protocol: "http",
            hostname: "scan.stie-mce.ac.id",
            pathname: "/photo/**",
         },
      ],
   },
};

export default nextConfig;
