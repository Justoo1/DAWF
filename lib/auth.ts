import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    // Add additional fields to the user object
    additionalFields: {
      dateOfBirth: {
        type: "date",
        required: false,
      },
    },
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn(user: any, account: any) {
      // Only allow sign-in with @devopsafricalimited.com emails for OAuth
      if (account?.providerId === "google") {
        const email = user.email.toLowerCase();
        if (!email.endsWith("@devopsafricalimited.com")) {
          throw new Error("Only DevOps Africa Limited employees can sign in with Google. Please use your @devopsafricalimited.com email.");
        }
      }

      // Check if the user is active
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { isActive: true }
      });

      if (dbUser && !dbUser.isActive) {
        throw new Error("Your account has been deactivated. Please contact the administrator for assistance.");
      }

      return true;
    },
  },
})