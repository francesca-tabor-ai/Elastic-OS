import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  const role = session?.user?.role;
  return role === "GOVERNMENT" || role === "ADMIN";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGovernment(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const policies = await prisma.subsidyPolicy.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { allocations: true } } },
  });

  return NextResponse.json({
    policies: policies.map((p) => ({
      id: p.id,
      name: p.name,
      maxEngagementThreshold: Number(p.maxEngagementThreshold),
      minEngagementThreshold: Number(p.minEngagementThreshold),
      subsidyAmountPerWorker: Number(p.subsidyAmountPerWorker),
      totalBudget: p.totalBudget ? Number(p.totalBudget) : null,
      effectiveFrom: p.effectiveFrom,
      effectiveTo: p.effectiveTo,
      status: p.status,
      allocationCount: p._count.allocations,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGovernment(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name,
    maxEngagementThreshold,
    minEngagementThreshold,
    subsidyAmountPerWorker,
    totalBudget,
    effectiveFrom,
    effectiveTo,
  } = body;

  if (!name || maxEngagementThreshold == null || minEngagementThreshold == null || subsidyAmountPerWorker == null || !effectiveFrom) {
    return NextResponse.json(
      { error: "name, maxEngagementThreshold, minEngagementThreshold, subsidyAmountPerWorker, effectiveFrom required" },
      { status: 400 }
    );
  }

  const policy = await prisma.subsidyPolicy.create({
    data: {
      name,
      maxEngagementThreshold: Number(maxEngagementThreshold),
      minEngagementThreshold: Number(minEngagementThreshold),
      subsidyAmountPerWorker: Number(subsidyAmountPerWorker),
      totalBudget: totalBudget != null ? Number(totalBudget) : null,
      effectiveFrom: new Date(effectiveFrom),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      status: "DRAFT",
    },
  });

  return NextResponse.json({
    id: policy.id,
    name: policy.name,
    status: policy.status,
  });
}
