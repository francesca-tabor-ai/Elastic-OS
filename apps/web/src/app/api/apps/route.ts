import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const scope = searchParams.get("scope");

    const where: { category?: string; scope?: string } = {};
    if (category) where.category = category;
    if (scope) where.scope = scope;

    const apps = await prisma.app.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(apps);
  } catch (error) {
    console.error("Apps list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
