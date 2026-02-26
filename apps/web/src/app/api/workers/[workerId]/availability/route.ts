import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getWorkerHeadroom,
  getOrCreateWorkerAvailability,
} from "@/lib/marketplace";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (
    session.user.role === "WORKER" &&
    session.user.workerId !== workerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const headroom = await getWorkerHeadroom(workerId);
  return NextResponse.json(headroom);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (
    session.user.role !== "WORKER" ||
    session.user.workerId !== workerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { maxTotalEngagement, openToOpportunities } = body;

  await getOrCreateWorkerAvailability(workerId);

  const updateData: Record<string, unknown> = {};
  if (typeof maxTotalEngagement === "number" && maxTotalEngagement >= 0.1 && maxTotalEngagement <= 2) {
    updateData.maxTotalEngagement = maxTotalEngagement;
  }
  if (typeof openToOpportunities === "boolean") {
    updateData.openToOpportunities = openToOpportunities;
  }

  if (Object.keys(updateData).length === 0) {
    const headroom = await getWorkerHeadroom(workerId);
    return NextResponse.json(headroom);
  }

  const { prisma } = await import("@elastic-os/db");
  await prisma.workerAvailability.update({
    where: { workerId },
    data: updateData,
  });

  const headroom = await getWorkerHeadroom(workerId);
  return NextResponse.json(headroom);
}
