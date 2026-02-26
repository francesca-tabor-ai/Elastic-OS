import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = (await req.json().catch(() => ({}))) as {
      entityType?: "worker" | "employer";
      config?: Record<string, unknown>;
    };
    const entityType = body.entityType ?? "worker";
    const config = body.config ?? null;

    const app = await prisma.app.findUnique({ where: { slug } });
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Resolve entityId from session
    let entityId: string;
    if (entityType === "worker") {
      if (!session.user.workerId) {
        return NextResponse.json(
          { error: "Worker profile required for worker-scoped apps" },
          { status: 400 }
        );
      }
      if (app.scope === "EMPLOYER") {
        return NextResponse.json(
          { error: "This app is for employers only" },
          { status: 400 }
        );
      }
      entityId = session.user.workerId;
    } else {
      if (!session.user.employerId) {
        return NextResponse.json(
          { error: "Employer profile required for employer-scoped apps" },
          { status: 400 }
        );
      }
      if (app.scope === "WORKER") {
        return NextResponse.json(
          { error: "This app is for workers only" },
          { status: 400 }
        );
      }
      entityId = session.user.employerId;
    }

    const installation = await prisma.appInstallation.upsert({
      where: {
        appId_entityType_entityId: {
          appId: app.id,
          entityType,
          entityId,
        },
      },
      create: {
        appId: app.id,
        userId: session.user.id,
        entityType,
        entityId,
        config,
      },
      update: { config, updatedAt: new Date() },
      include: { app: true },
    });

    return NextResponse.json({
      success: true,
      installation: {
        id: installation.id,
        app: installation.app,
        entityType: installation.entityType,
        installedAt: installation.installedAt,
      },
    });
  } catch (error) {
    console.error("Install error:", error);
    return NextResponse.json(
      { error: "Failed to install app" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const app = await prisma.app.findUnique({ where: { slug } });
    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const workerId = session.user.workerId ?? undefined;
    const employerId = session.user.employerId ?? undefined;
    const entityId = workerId ?? employerId;
    const entityType = workerId ? "worker" : "employer";

    if (!entityId) {
      return NextResponse.json(
        { error: "No worker or employer profile to uninstall from" },
        { status: 400 }
      );
    }

    await prisma.appInstallation.deleteMany({
      where: {
        appId: app.id,
        entityType,
        entityId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Uninstall error:", error);
    return NextResponse.json(
      { error: "Failed to uninstall app" },
      { status: 500 }
    );
  }
}
