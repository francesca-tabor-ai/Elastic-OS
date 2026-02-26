import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import {
  computeReactivationProbability,
  upsertReactivationPrediction,
} from "@/lib/ai/reactivation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string; workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId, workerId } = await params;

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshot = await prisma.affiliationSnapshot.findUnique({
    where: { workerId_employerId: { workerId, employerId } },
  });

  const currentIntensity = snapshot
    ? Number(snapshot.engagementIntensity)
    : 1;

  const result = await computeReactivationProbability(
    workerId,
    employerId,
    currentIntensity
  );

  return NextResponse.json(result);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ employerId: string; workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId, workerId } = await params;

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshot = await prisma.affiliationSnapshot.findUnique({
    where: { workerId_employerId: { workerId, employerId } },
  });

  const currentIntensity = snapshot
    ? Number(snapshot.engagementIntensity)
    : 1;

  await upsertReactivationPrediction(workerId, employerId, currentIntensity);
  const result = await computeReactivationProbability(
    workerId,
    employerId,
    currentIntensity
  );

  return NextResponse.json(result);
}
