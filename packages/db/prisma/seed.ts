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

  // Phase 2: Seed skill metadata for depreciation predictor
  const skillMetadata = [
    { skillName: "javascript", halfLifeMonths: 36, demandTrend: "STABLE", relatedSkills: ["typescript", "react", "node.js"] },
    { skillName: "typescript", halfLifeMonths: 48, demandTrend: "GROWING", relatedSkills: ["javascript", "react", "node.js"] },
    { skillName: "react", halfLifeMonths: 30, demandTrend: "STABLE", relatedSkills: ["next.js", "vue", "typescript"] },
    { skillName: "python", halfLifeMonths: 48, demandTrend: "GROWING", relatedSkills: ["fastapi", "pytest", "machine learning"] },
    { skillName: "sql", halfLifeMonths: 60, demandTrend: "STABLE", relatedSkills: ["postgresql", "mongodb", "data modeling"] },
    { skillName: "aws", halfLifeMonths: 24, demandTrend: "GROWING", relatedSkills: ["kubernetes", "terraform", "cloud architecture"] },
    { skillName: "kubernetes", halfLifeMonths: 36, demandTrend: "GROWING", relatedSkills: ["docker", "helm", "aws"] },
  ];
  for (const s of skillMetadata) {
    await prisma.skillMetadata.upsert({
      where: { skillName: s.skillName },
      create: s,
      update: { halfLifeMonths: s.halfLifeMonths, demandTrend: s.demandTrend, relatedSkills: s.relatedSkills },
    });
  }
  console.log(`Seeded ${skillMetadata.length} skill metadata entries`);

  console.log("\nDemo users ready. See DEMO_CREDENTIALS.md for login details.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
