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
            protocol: "http",
            hostname: "scan.stie-mce.ac.id",
            pathname: "/photo/**",
         },
      ],
   },
   serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
