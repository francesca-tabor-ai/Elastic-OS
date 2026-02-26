import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { createElasticityContract } from "@/lib/elasticity-contract";

function isEmployerOrAdmin(session: { user?: { role?: string; employerId?: string } } | null, employerId: string): boolean {
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  return session.user.role === "EMPLOYER" && session.user.employerId === employerId;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employerId } = await params;
  if (!isEmployerOrAdmin(session, employerId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const contracts = await prisma.elasticityContract.findMany({
    where: { employerId },
    include: { worker: { include: { user: true } } },
    orderBy: { reactivationPriority: "desc" },
  });

  return NextResponse.json({
    contracts: contracts.map((c) => ({
      id: c.id,
      workerId: c.workerId,
      email: c.worker?.user?.email,
      minEngagement: Number(c.minEngagement),
      maxEngagement: Number(c.maxEngagement),
      effectiveFrom: c.effectiveFrom,
      effectiveTo: c.effectiveTo,
      reactivationPriority: c.reactivationPriority,
      status: c.status,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employerId } = await params;
  if (!isEmployerOrAdmin(session, employerId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { workerId, minEngagement, maxEngagement, effectiveFrom, effectiveTo, reactivationPriority } = body;

  if (!workerId || minEngagement == null || maxEngagement == null || !effectiveFrom) {
    return NextResponse.json(
      { error: "workerId, minEngagement, maxEngagement, effectiveFrom required" },
      { status: 400 }
    );
  }

  await createElasticityContract(workerId, employerId, {
    minEngagement: Number(minEngagement),
    maxEngagement: Number(maxEngagement),
    effectiveFrom: new Date(effectiveFrom),
    effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
    reactivationPriority: reactivationPriority ?? 0,
  });

  return NextResponse.json({ success: true });
}
