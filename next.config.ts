import type { NextConfig } from "next";
// @ts-expect-error -- next-pwa has no type declarations
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
