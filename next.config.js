/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // 🚫 Ignore ESLint errors during production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚫 Ignore TypeScript type errors during production build
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true,
    swcPlugins: [],
  },
  async rewrites() {
    // Allow client-side routing inside the Docusaurus static export
    return [
      {
        source: "/docs/:path*",
        destination: "/docs/:path*",
      },
    ];
  },
};

export default config;
