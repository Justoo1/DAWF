"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const COMPANY_EMAIL_SUFFIX = "@devopsafricalimited.com";

export type AccountGateState =
  | { authenticated: false }
  | {
      authenticated: true;
      domainOk: boolean;
      isActive: boolean;
      pendingInvite: boolean;
      mustChangePassword: boolean;
    };

export async function getAccountGateState(): Promise<AccountGateState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    return { authenticated: false };
  }

  const email = session.user.email.toLowerCase();
  const domainOk = email.endsWith(COMPANY_EMAIL_SUFFIX);

  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isActive: true, pendingInvite: true, mustChangePassword: true },
  });

  return {
    authenticated: true,
    domainOk,
    isActive: u?.isActive ?? true,
    pendingInvite: u?.pendingInvite ?? false,
    mustChangePassword: u?.mustChangePassword ?? false,
  };
}
