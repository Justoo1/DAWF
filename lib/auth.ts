import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import prisma from "./prisma";

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
      clientId: {
        type: "string",
        required: false,
      },
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
