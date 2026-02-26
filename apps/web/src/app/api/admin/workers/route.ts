import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    await getAdminSession();
    const workers = await prisma.worker.findMany({
      include: { user: true, workerProfile: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(workers);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminSession();
    const body = await req.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    const existing = await prisma.worker.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json({ error: "User already has a worker profile" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const worker = await prisma.worker.create({
      data: { userId },
      include: { user: true, workerProfile: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { role: "WORKER" },
    });
    return NextResponse.json(worker);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
