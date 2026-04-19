import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { getAuthAppOrigin } from "./auth-app-url";
import { allowedWorkEmailMessage, isAllowedWorkEmail } from "./allowed-email-domains";
import prisma from "./prisma";

const ONE_HOUR_S = 60 * 60
const ONE_DAY_S = 60 * 60 * 24

export const auth = betterAuth({
  baseURL: getAuthAppOrigin(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: ONE_DAY_S,
    updateAge: ONE_HOUR_S,
  },
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
      role: {
        type: "string",
        required: false,
        defaultValue: "EMPLOYEE",
      },
      canApproveBookings: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      department: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
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
        select: { isActive: true, email: true },
      });
      if (user && !isAllowedWorkEmail(user.email)) {
        await prisma.session.deleteMany({ where: { userId } });
        throw new APIError("FORBIDDEN", {
          message: allowedWorkEmailMessage(),
        });
      }
      if (user && !user.isActive) {
        await prisma.session.deleteMany({ where: { userId } });
        throw new APIError("FORBIDDEN", {
          message: "This account has been disabled. Contact your administrator.",
        });
      }
    }),
  },
});
