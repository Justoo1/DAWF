/**
 * Better Auth `baseURL` must be the site origin only. Paths in env produce a
 * doubled `/callback/google` in Google’s redirect_uri.
 */
export function normalizeToOrigin(input: string): string {
  const t = input.trim().replace(/\/+$/, "");
  if (!t) return "http://localhost:3000";
  try {
    const withProto = /^https?:\/\//i.test(t) ? t : `http://${t}`;
    const u = new URL(withProto);
    return `${u.protocol}//${u.host}`;
  } catch {
    return t.replace(/\/+$/, "");
  }
}

function vercelUrlOrigin(): string | undefined {
  const v = process.env.VERCEL_URL?.trim();
  if (!v) return undefined;
  return `https://${v.replace(/^https?:\/\//, "")}`;
}

/** First URL from env (no default). Shared by Next config and server `getAuthAppOrigin`. */
export function getAuthEnvCandidate(): string | undefined {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim() ||
    process.env.URL?.trim() ||
    process.env.DEPLOY_PRIME_URL?.trim() ||
    vercelUrlOrigin()
  );
}

export function getAuthAppOrigin(): string {
  return normalizeToOrigin(getAuthEnvCandidate() ?? "http://localhost:3000");
}

/** Absolute URL for a path on this app (emails, notifications). */
export function getAuthAppUrl(path: string): string {
  const origin = getAuthAppOrigin().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

/** Browser: inlined `NEXT_PUBLIC_*` or current origin; server: same as `getAuthAppOrigin`. */
export function getAuthClientBaseURL(): string {
  if (typeof window !== "undefined") {
    const fromEnv = process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim();
    if (fromEnv) return normalizeToOrigin(fromEnv);
    return window.location.origin;
  }
  return getAuthAppOrigin();
}
