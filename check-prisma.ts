import prisma from "./lib/prisma";

async function check() {
  console.log("Prisma keys:", Object.keys(prisma));
  console.log("Prisma.department:", (prisma as any).department);
  if ((prisma as any).department) {
    console.log("Department.create exists:", typeof (prisma as any).department.create);
  }
}

check();
