import type { NextConfig } from "next";
import { getAuthEnvCandidate, normalizeToOrigin } from "./lib/auth-app-url";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
});

const authEnvCandidate = getAuthEnvCandidate();

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Always load Prisma from node_modules so `prisma generate` is picked up (avoids stale Policy schema in .next).
  serverExternalPackages: ["@prisma/client"],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth profile images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub avatars (if needed)
      },
    ],
  },

  experimental: {
    serverActions: {
      // Policy (and similar) uploads send base64 in the action body; allow ~10MB files after encoding.
      bodySizeLimit: '20mb',
    },
  },

  env: {
    ...(authEnvCandidate
      ? { NEXT_PUBLIC_BETTER_AUTH_URL: normalizeToOrigin(authEnvCandidate) }
      : {}),
  },

  async headers() {
    const headers: { key: string; value: string }[] = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
    ]
    // Prevent clickjacking in production only. Omit in dev so localhost can load in iframes (e.g. IDE browser preview).
    if (process.env.NODE_ENV === "production") {
      headers.unshift({ key: "X-Frame-Options", value: "DENY" })
    }
    return [{ source: "/(.*)", headers }]
  },
};

export default withPWA(nextConfig);
