import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Prisma } from "@prisma/client";
import { APIError, createAuthMiddleware } from "better-auth/api";
import prisma from "./prisma";
import { sendEmployeeVerificationEmail } from "./auth-email";

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
    enabled: false,
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
      try {
        const result = await sendEmployeeVerificationEmail(
          user.email,
          user.name || user.email,
          url
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
    },
    async onEmailVerification(user: { email: string }) {
      await clearPendingInviteForEmail(user.email);
    },
    async afterEmailVerification(user: { email: string }) {
      await clearPendingInviteForEmail(user.email);
    },
  },
  hooks: {
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
