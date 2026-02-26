import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (session.user.role === "WORKER" && session.user.workerId !== workerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      workerProfile: true,
      workerSkills: true,
      certifications: true,
      portfolioItems: true,
      employerReferences: { include: { employer: { include: { employerProfile: true } } } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "WORKER" || session.user.workerId !== (await params).workerId) {
    return NextResponse.json({ error: "Forbidden: only the worker can update their profile" }, { status: 403 });
  }

  const { workerId } = await params;
  const body = await req.json();
  const { headline, bio } = body;

  const updated = await prisma.workerProfile.upsert({
    where: { workerId },
    create: { workerId, headline, bio },
    update: { headline, bio },
  });

  return NextResponse.json(updated);
}
