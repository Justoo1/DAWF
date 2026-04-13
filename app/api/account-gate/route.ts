import { getAccountGateState } from "@/lib/actions/account-gate.action";
import { NextResponse } from "next/server";

/**
 * JSON gate state for client components (e.g. ProfileChecker in useEffect).
 * Avoids calling server actions from effects, which can throw (undefined `.apply`).
 */
export async function GET() {
  const gate = await getAccountGateState();
  return NextResponse.json(gate);
}
