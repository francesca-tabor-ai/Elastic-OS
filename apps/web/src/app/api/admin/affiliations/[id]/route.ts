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
    const record = await prisma.affiliationRecord.findUnique({
      where: { id },
      include: { worker: { include: { user: true } }, employer: { include: { user: true } } },
    });
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    await prisma.affiliationRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
