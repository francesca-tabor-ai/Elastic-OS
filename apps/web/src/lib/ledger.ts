import { prisma } from "@elastic-os/db";
import { AffiliationRecordType } from "@elastic-os/db";
import { MIN_ENGAGEMENT_INTENSITY, MAX_ENGAGEMENT_INTENSITY } from "@elastic-os/shared";
import { Decimal } from "@prisma/client/runtime/library";

function toDecimal(n: number): Decimal {
  return new Decimal(n);
}

function validIntensity(n: number): boolean {
  return n >= MIN_ENGAGEMENT_INTENSITY && n <= MAX_ENGAGEMENT_INTENSITY;
}

export async function createOrAdjustAffiliation(params: {
  workerId: string;
  employerId: string;
  engagementIntensity: number;
  recordType: AffiliationRecordType;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}) {
  const { workerId, employerId, engagementIntensity, recordType, createdBy, metadata } = params;

  if (!validIntensity(engagementIntensity)) {
    throw new Error(`Engagement intensity must be between ${MIN_ENGAGEMENT_INTENSITY} and ${MAX_ENGAGEMENT_INTENSITY}`);
  }

  return prisma.$transaction(async (tx) => {
    const now = new Date();

    // Close any active affiliation for this worker-employer pair
    const existingSnapshot = await tx.affiliationSnapshot.findUnique({
      where: { workerId_employerId: { workerId, employerId } },
    });

    if (existingSnapshot) {
      await tx.affiliationRecord.updateMany({
        where: {
          workerId,
          employerId,
          effectiveTo: null,
        },
        data: { effectiveTo: now },
      });
    }

    const record = await tx.affiliationRecord.create({
      data: {
        workerId,
        employerId,
        engagementIntensity: toDecimal(engagementIntensity),
        effectiveFrom: now,
        effectiveTo: recordType === "TERMINATED" ? now : null,
        recordType,
        createdBy,
        metadata: (metadata ?? undefined) as object | undefined,
      },
    });

    if (recordType !== "TERMINATED") {
      await tx.affiliationSnapshot.upsert({
        where: { workerId_employerId: { workerId, employerId } },
        create: {
          workerId,
          employerId,
          engagementIntensity: toDecimal(engagementIntensity),
        },
        update: {
          engagementIntensity: toDecimal(engagementIntensity),
        },
      });
    } else {
      await tx.affiliationSnapshot.deleteMany({
        where: { workerId, employerId },
      });
    }

    return record;
  });
}

export async function getWorkerAffiliationHistory(workerId: string) {
  return prisma.affiliationRecord.findMany({
    where: { workerId },
    orderBy: { createdAt: "desc" },
    include: {
      employer: { include: { employerProfile: true } },
    },
  });
}

export async function getEmployerAffiliationHistory(employerId: string) {
  return prisma.affiliationRecord.findMany({
    where: { employerId },
    orderBy: { createdAt: "desc" },
    include: {
      worker: { include: { user: true, workerProfile: true } },
    },
  });
}

export async function getWorkerEmployerAffiliation(workerId: string, employerId: string) {
  const [snapshot, history] = await Promise.all([
    prisma.affiliationSnapshot.findUnique({
      where: { workerId_employerId: { workerId, employerId } },
      include: { employer: { include: { employerProfile: true } } },
    }),
    prisma.affiliationRecord.findMany({
      where: { workerId, employerId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { current: snapshot, history };
}
