import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "joel.acquah@devopsafricalimited.com";
const DEFAULT_CLIENT_ID = "cmigrationdefaultclient";

async function seedAdmin() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (existing) {
      const updated = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: "ADMIN", isActive: true, emailVerified: true },
      });
      console.log(`Admin user already exists — role confirmed ADMIN (id: ${updated.id})`);
      return;
    }

    const user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: "Joel Acquah",
        firstName: "Joel",
        lastName: "Acquah",
        phoneNumber: "",
        clientId: DEFAULT_CLIENT_ID,
        role: "ADMIN",
        employmentType: "FULL_TIME",
        isActive: true,
        isContributor: true,
        canApproveBookings: true,
        emailVerified: true,
      },
    });

    console.log(`Admin user created (id: ${user.id})`);
    console.log(`Email: ${user.email}`);
    console.log(`Sign in with Google at http://localhost:3000`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
