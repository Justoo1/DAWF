import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Prisma } from "@prisma/client";
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
      void sendEmployeeVerificationEmail(
        user.email,
        user.name || user.email,
        url
      );
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
});
