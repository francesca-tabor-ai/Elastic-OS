import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    await getAdminSession();
    const roles = await prisma.jobRole.findMany({
      include: { employer: { include: { user: true } }, department: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(roles);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminSession();
    const body = await req.json();
    const { employerId, title, departmentId } = body;
    if (!employerId || !title) {
      return NextResponse.json(
        { error: "employerId and title are required" },
        { status: 400 }
      );
    }
    const role = await prisma.jobRole.create({
      data: {
        employerId,
        title,
        departmentId: departmentId ?? undefined,
      },
      include: { employer: { include: { user: true } }, department: true },
    });
    return NextResponse.json(role);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
