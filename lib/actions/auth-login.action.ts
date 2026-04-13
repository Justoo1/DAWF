"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateRandomString, hashPassword } from "better-auth/crypto";
import {
  getPasswordPolicyFailureMessage,
  passwordMeetsPolicy,
} from "@/lib/password-policy";

export type EmailLoginState =
  | { status: "invalid_email" }
  | { status: "not_provisioned" }
  | { status: "account_disabled" }
  | { status: "needs_verification" }
  | { status: "needs_password_setup" }
  | { status: "ready" };

export async function getEmailLoginState(
  email: string
): Promise<EmailLoginState> {
  const trimmed = email.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { status: "invalid_email" };
  }
  const user = await prisma.user.findFirst({
    where: { email: { equals: trimmed, mode: "insensitive" } },
    select: {
      isActive: true,
      emailVerified: true,
      pendingInvite: true,
      accounts: {
        where: { providerId: "credential" },
        select: { password: true },
        take: 1,
      },
    },
  });
  if (!user) return { status: "not_provisioned" };
  if (!user.isActive) return { status: "account_disabled" };
  if (!user.emailVerified || user.pendingInvite) {
    return { status: "needs_verification" };
  }
  const cred = user.accounts[0];
  const hasPassword = !!(cred?.password && cred.password.length > 0);
  if (!hasPassword) return { status: "needs_password_setup" };
  return { status: "ready" };
}

function authAppOrigin() {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Public: always returns ok so we do not leak whether the email exists. */
export async function requestPasswordResetForEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: true as const };
  }
  const redirectTo = `${authAppOrigin()}/reset-password`;
  try {
    await auth.api.requestPasswordReset({
      body: {
        email: trimmed,
        redirectTo,
      },
      headers: await headers(),
    });
  } catch (e) {
    console.error("requestPasswordResetForEmail", e);
  }
  return { ok: true as const };
}

/**
 * First-time password update after admin-set or generated initial password.
 * Does not require the current password; only allowed when `mustChangePassword` is true.
 */
export async function submitInitialPasswordChange(newPassword: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false, error: "Not signed in" };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true },
  });
  if (!user?.mustChangePassword) {
    return {
      success: false,
      error: "You do not need to change your password here.",
    };
  }
  const trimmed = newPassword.trim();
  if (!passwordMeetsPolicy(trimmed)) {
    return {
      success: false,
      error: getPasswordPolicyFailureMessage(trimmed),
    };
  }
  const hashed = await hashPassword(trimmed);
  const cred = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "credential" },
  });
  const now = new Date();
  if (!cred) {
    await prisma.account.create({
      data: {
        id: generateRandomString(24, "a-z", "A-Z", "0-9"),
        accountId: session.user.id,
        providerId: "credential",
        userId: session.user.id,
        password: hashed,
        createdAt: now,
        updatedAt: now,
      },
    });
  } else {
    await prisma.account.update({
      where: { id: cred.id },
      data: { password: hashed, updatedAt: now },
    });
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { mustChangePassword: false },
  });
  return { success: true };
}
