/**
 * Canonical public origin for links in emails and Better Auth redirects.
 */
export function getAuthAppOrigin(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/**
 * Where users land after clicking “verify email” (Better Auth `callbackURL`).
 * Query flag drives a one-time welcome / password reminder on `/dawf`.
 */
export function postEmailVerificationCallbackUrl(): string {
  return `${getAuthAppOrigin()}/dawf?emailVerified=1`;
}

/**
 * Same URL for browser code (`sendVerificationEmail` from the auth client).
 */
export function postEmailVerificationCallbackUrlForClient(): string {
  const base = (
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL || window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}/dawf?emailVerified=1`;
}
