import type { AccountGateState } from "@/lib/actions/account-gate.action";

/** For client components (e.g. useEffect). Prefer over server actions there. */
export async function fetchAccountGateState(): Promise<AccountGateState> {
  const res = await fetch("/api/account-gate", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    return { authenticated: false };
  }
  return res.json() as Promise<AccountGateState>;
}
