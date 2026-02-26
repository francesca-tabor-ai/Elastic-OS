import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { employerId },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    opportunities: opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      engagementIntensity: Number(o.engagementIntensity),
      durationMonths: o.durationMonths,
      requiredSkills: o.requiredSkills,
      status: o.status,
      applicationCount: o._count.applications,
      createdAt: o.createdAt,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (
    session.user.role !== "EMPLOYER" ||
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    description,
    engagementIntensity,
    durationMonths,
    requiredSkills,
  } = body;

  if (!title || engagementIntensity == null) {
    return NextResponse.json(
      { error: "title and engagementIntensity required" },
      { status: 400 }
    );
  }

  const intensity = Number(engagementIntensity);
  if (intensity < 0.1 || intensity > 1) {
    return NextResponse.json(
      { error: "engagementIntensity must be between 0.1 and 1" },
      { status: 400 }
    );
  }

  const skills = Array.isArray(requiredSkills)
    ? requiredSkills.map(String).filter(Boolean)
    : [];

  const opportunity = await prisma.opportunity.create({
    data: {
      employerId,
      title,
      description: description ?? null,
      engagementIntensity: intensity,
      durationMonths: durationMonths ?? null,
      requiredSkills: skills,
      status: "OPEN",
    },
  });

  return NextResponse.json({
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description,
    engagementIntensity: Number(opportunity.engagementIntensity),
    durationMonths: opportunity.durationMonths,
    requiredSkills: opportunity.requiredSkills,
    status: opportunity.status,
    createdAt: opportunity.createdAt,
  });
}
