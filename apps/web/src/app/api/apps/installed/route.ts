import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workerId = session.user.workerId;
    const employerId = session.user.employerId;
    const conditions: { entityType: string; entityId: string }[] = [];
    if (workerId) conditions.push({ entityType: "worker", entityId: workerId });
    if (employerId) conditions.push({ entityType: "employer", entityId: employerId });

    if (conditions.length === 0) {
      return NextResponse.json([]);
    }

    const installations = await prisma.appInstallation.findMany({
      where: { OR: conditions },
      include: { app: true },
      orderBy: { installedAt: "desc" },
    });

    return NextResponse.json(installations);
  } catch (error) {
    console.error("Installed apps error:", error);
    return NextResponse.json(
      { error: "Failed to fetch installed apps" },
      { status: 500 }
    );
  }
}
