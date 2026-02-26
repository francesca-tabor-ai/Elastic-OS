import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    await getAdminSession();
    const employers = await prisma.employer.findMany({
      include: { user: true, employerProfile: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(employers);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminSession();
    const body = await req.json();
    const { userId, companiesHouseNumber } = body;
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    const existing = await prisma.employer.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json({ error: "User already has an employer profile" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const employer = await prisma.employer.create({
      data: { userId, companiesHouseNumber: companiesHouseNumber ?? undefined },
      include: { user: true, employerProfile: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { role: "EMPLOYER" },
    });
    return NextResponse.json(employer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
