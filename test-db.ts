import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  try {
    const dept = await prisma.department.create({
      data: {
        name: "Testing",
        managerId: null,
      },
    });
    console.log("Success:", dept);
  } catch (err: any) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
