import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed data goes here as the schema grows.
  // Example:
  // await prisma.waitlistSignup.upsert({
  //   where: { email: "founder@prova.app" },
  //   update: {},
  //   create: { email: "founder@prova.app", role: "company" },
  // });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
