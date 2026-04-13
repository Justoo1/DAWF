import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const base = new PrismaClient();
  return base.$extends({
    query: {
      user: {
        async update({ args, query }) {
          const id =
            typeof args.where?.id === "string" ? args.where.id : undefined;
          const data = args.data;
          if (
            id &&
            data &&
            typeof data === "object" &&
            "emailVerified" in data &&
            (data as { emailVerified?: boolean }).emailVerified === true
          ) {
            const current = await base.user.findUnique({
              where: { id },
              select: { pendingInvite: true },
            });
            if (current?.pendingInvite) {
              (data as { emailVerified?: boolean }).emailVerified = false;
            }
          }
          return query(args);
        },
      },
    },
  });
}

type PrismaClientExtended = ReturnType<typeof createPrismaClient>;

declare const globalThis: {
  prismaGlobal: PrismaClientExtended | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
