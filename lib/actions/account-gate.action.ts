"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export type AccountGateState =
  | { authenticated: false }
  | {
      authenticated: true;
      isActive: boolean;
    };

export async function getAccountGateState(): Promise<AccountGateState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    return { authenticated: false };
  }

  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isActive: true },
  });

  return {
    authenticated: true,
    isActive: u?.isActive ?? true,
  };
}
