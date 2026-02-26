import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

const APP_CATEGORIES = ["WORKFLOW", "INTEGRATION", "REPORTING", "COMPLIANCE", "PRODUCTIVITY"] as const;
const APP_SCOPES = ["WORKER", "EMPLOYER", "BOTH"] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    const app = await prisma.app.findUnique({ where: { id } });
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(app);
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
    const {
      slug,
      name,
      description,
      longDescription,
      icon,
      iconUrl,
      category,
      scope,
      vendor,
      isBuiltIn,
      installUrl,
    } = body;

    if (category && !APP_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (scope && !APP_SCOPES.includes(scope)) {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }

    const app = await prisma.app.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(name && { name }),
        ...(description && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(icon !== undefined && { icon }),
        ...(iconUrl !== undefined && { iconUrl }),
        ...(category && { category }),
        ...(scope && { scope }),
        ...(vendor !== undefined && { vendor }),
        ...(isBuiltIn !== undefined && { isBuiltIn }),
        ...(installUrl !== undefined && { installUrl }),
      },
    });
    return NextResponse.json(app);
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
    await prisma.app.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
