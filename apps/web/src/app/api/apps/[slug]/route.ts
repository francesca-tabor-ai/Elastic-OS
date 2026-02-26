import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const app = await prisma.app.findUnique({
      where: { slug },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error("App fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch app" },
      { status: 500 }
    );
  }
}
