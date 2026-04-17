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
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
