import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@elastic-os/db";
import { REGISTRABLE_ROLES } from "@elastic-os/shared";
import type { UserRole } from "@elastic-os/shared";

const SALT_ROUNDS = 10;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!REGISTRABLE_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be WORKER, EMPLOYER, or GOVERNMENT" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as UserRole,
      },
    });

    // Create Worker or Employer profile based on role
    if (role === "WORKER") {
      await prisma.worker.create({
        data: { userId: user.id },
      });
    } else if (role === "EMPLOYER") {
      await prisma.employer.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      message: "Registration successful. Please log in.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
