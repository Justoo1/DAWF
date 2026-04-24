import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  try {
    const client = await prisma.client.findFirst({ select: { id: true } });
    if (!client) {
      console.error("No client in DB; create one before running this test.");
      return;
    }
    const dept = await prisma.department.create({
      data: {
        name: "Testing",
        clientId: client.id,
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
