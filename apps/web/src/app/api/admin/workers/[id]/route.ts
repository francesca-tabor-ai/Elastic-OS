import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: { user: true, workerProfile: true, workerSkills: true, certifications: true, portfolioItems: true },
    });
    if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(worker);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    const body = await req.json();
    const { govtIdVerifiedAt, mfaEnabled } = body;

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        ...(govtIdVerifiedAt !== undefined && {
          govtIdVerifiedAt: govtIdVerifiedAt ? new Date(govtIdVerifiedAt) : null,
        }),
        ...(mfaEnabled !== undefined && { mfaEnabled }),
      },
      include: { user: true, workerProfile: true },
    });
    return NextResponse.json(worker);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    await prisma.worker.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
