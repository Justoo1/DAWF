import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Prisma } from "@prisma/client";
import { APIError, createAuthMiddleware } from "better-auth/api";
import prisma from "./prisma";
import {
  sendEmployeeVerificationEmail,
  sendPasswordResetEmail,
} from "./auth-email";

/** Case-insensitive match so JWT / Better Auth email lines up with how the row was stored. */
async function clearPendingInviteForEmail(email: string) {
  const e = email.trim();
  if (!e) return;
  await prisma.$executeRaw(
    Prisma.sql`UPDATE "users" SET "pendingInvite" = false WHERE LOWER("email") = LOWER(${e})`
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(
        user.email,
        user.name || user.email,
        url
      );
    },
    onPasswordReset: async ({ user }) => {
      await prisma.user.updateMany({
        where: { id: user.id },
        data: { mustChangePassword: false },
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      disableImplicitSignUp: true,
    },
  },
  user: {
    additionalFields: {
      dateOfBirth: {
        type: "date",
        required: false,
      },
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      pendingInvite: {
        type: "boolean",
        required: false,
      },
      clientId: {
        type: "string",
        required: false,
      },
      mustChangePassword: {
        type: "boolean",
        required: false,
      },
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const row = await prisma.user.findUnique({
        where: { id: user.id },
        select: { verificationEmailPasswordPlain: true },
      });
      const initialPassword = row?.verificationEmailPasswordPlain ?? undefined;
      try {
        const result = await sendEmployeeVerificationEmail(
          user.email,
          user.name || user.email,
          url,
          initialPassword ? { initialPassword } : undefined
        );
        if (
          result &&
          typeof result === "object" &&
          "success" in result &&
          (result as { success: boolean }).success === false
        ) {
          console.error(
            "sendEmployeeVerificationEmail: Resend reported failure",
            result
          );
        }
      } catch (e) {
        console.error("sendEmployeeVerificationEmail failed:", e);
      }
      if (initialPassword) {
        await prisma.user.update({
          where: { id: user.id },
          data: { verificationEmailPasswordPlain: null },
        });
      }
    },
    // Runs before `emailVerified` is written (see better-auth verify-email route).
    async onEmailVerification(user: { email: string }) {
      await clearPendingInviteForEmail(user.email);
    },
    // Backup: ensures flag clears even if the flow differs between Better Auth versions.
    async afterEmailVerification(user: { email: string }) {
      await clearPendingInviteForEmail(user.email);
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const body = ctx.body as { email?: string } | undefined;
      const email = body?.email?.trim();
      if (!email) return;
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { isActive: true },
      });
      if (user && !user.isActive) {
        throw new APIError("FORBIDDEN", {
          message: "This account has been disabled. Contact your administrator.",
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession as
        | { user?: { id?: string } }
        | null
        | undefined;
      const userId = newSession?.user?.id;
      if (!userId) return;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isActive: true },
      });
      if (user && !user.isActive) {
        await prisma.session.deleteMany({ where: { userId } });
        throw new APIError("FORBIDDEN", {
          message: "This account has been disabled. Contact your administrator.",
        });
      }
    }),
  },
});
