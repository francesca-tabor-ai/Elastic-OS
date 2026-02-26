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
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { employer: true, parentDepartment: true },
    });
    if (!dept) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(dept);
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
    const { name, parentDepartmentId } = body;
    const dept = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(parentDepartmentId !== undefined && { parentDepartmentId: parentDepartmentId || null }),
      },
      include: { employer: { include: { user: true } } },
    });
    return NextResponse.json(dept);
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
    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
