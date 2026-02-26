import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    await getAdminSession();
    const logs = await prisma.verificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return NextResponse.json(logs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
