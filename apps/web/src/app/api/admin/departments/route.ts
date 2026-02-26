import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    await getAdminSession();
    const depts = await prisma.department.findMany({
      include: { employer: { include: { user: true } }, parentDepartment: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(depts);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminSession();
    const body = await req.json();
    const { employerId, name, parentDepartmentId } = body;
    if (!employerId || !name) {
      return NextResponse.json(
        { error: "employerId and name are required" },
        { status: 400 }
      );
    }
    const dept = await prisma.department.create({
      data: {
        employerId,
        name,
        parentDepartmentId: parentDepartmentId ?? undefined,
      },
      include: { employer: { include: { user: true } } },
    });
    return NextResponse.json(dept);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
