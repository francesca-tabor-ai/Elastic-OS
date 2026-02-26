import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

const APP_CATEGORIES = ["WORKFLOW", "INTEGRATION", "REPORTING", "COMPLIANCE", "PRODUCTIVITY"] as const;
const APP_SCOPES = ["WORKER", "EMPLOYER", "BOTH"] as const;

export async function GET() {
  try {
    await getAdminSession();
    const apps = await prisma.app.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(apps);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminSession();
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

    if (!slug || !name || !description || !category) {
      return NextResponse.json(
        { error: "slug, name, description, and category are required" },
        { status: 400 }
      );
    }
    if (!APP_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const app = await prisma.app.create({
      data: {
        slug,
        name,
        description,
        longDescription: longDescription ?? undefined,
        icon: icon ?? undefined,
        iconUrl: iconUrl ?? undefined,
        category,
        scope: scope && APP_SCOPES.includes(scope) ? scope : "BOTH",
        vendor: vendor ?? "ElasticOS",
        isBuiltIn: isBuiltIn ?? true,
        installUrl: installUrl ?? undefined,
      },
    });
    return NextResponse.json(app);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
