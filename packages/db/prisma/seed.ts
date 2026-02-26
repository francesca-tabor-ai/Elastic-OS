import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const DEMO_PASSWORD = "Demo123!";

const demoUsers = [
  { email: "worker@demo.elasticos.com", role: "WORKER" as const, name: "Demo Worker" },
  { email: "employer@demo.elasticos.com", role: "EMPLOYER" as const, name: "Demo Employer" },
  { email: "government@demo.elasticos.com", role: "GOVERNMENT" as const, name: "Demo Government" },
  { email: "admin@demo.elasticos.com", role: "ADMIN" as const, name: "Demo Admin" },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`User ${u.email} already exists, skipping`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
      },
    });

    if (u.role === "WORKER") {
      await prisma.worker.create({ data: { userId: user.id } });
    } else if (u.role === "EMPLOYER") {
      await prisma.employer.create({ data: { userId: user.id } });
    }

    console.log(`Created ${u.role}: ${u.email}`);
  }

  console.log("\nDemo users ready. See DEMO_CREDENTIALS.md for login details.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
