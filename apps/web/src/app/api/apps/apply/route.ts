import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";

const APP_TYPES = ["WORKFLOW", "INTEGRATION", "REPORTING", "COMPLIANCE", "PRODUCTIVITY"];
const TARGET_AUDIENCE = ["WORKER", "EMPLOYER", "BOTH"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      company,
      website,
      country,
      appType,
      targetAudience,
      appConcept,
      problemSolved,
      hasIntegrationsExperience,
      technicalApproach,
      marketingOptIn,
    } = body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !company?.trim() || !country?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, email, company, and country are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!appType || !Array.isArray(appType) || appType.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one app type" },
        { status: 400 }
      );
    }

    const validAppTypes = appType.filter((t: string) => APP_TYPES.includes(t));
    if (validAppTypes.length === 0) {
      return NextResponse.json(
        { error: "Invalid app type selected" },
        { status: 400 }
      );
    }

    if (!targetAudience || !TARGET_AUDIENCE.includes(targetAudience)) {
      return NextResponse.json(
        { error: "Please select target audience (Workers, Employers, or Both)" },
        { status: 400 }
      );
    }

    if (!appConcept?.trim() || appConcept.trim().length < 50) {
      return NextResponse.json(
        { error: "Please describe your app concept in at least 50 characters" },
        { status: 400 }
      );
    }

    const application = await prisma.appDeveloperApplication.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        website: website?.trim() || null,
        country: country.trim(),
        appType: validAppTypes,
        targetAudience,
        appConcept: appConcept.trim(),
        problemSolved: problemSolved?.trim() || null,
        hasIntegrationsExperience: Boolean(hasIntegrationsExperience),
        technicalApproach: technicalApproach?.trim() || null,
        marketingOptIn: Boolean(marketingOptIn),
      },
    });

    return NextResponse.json({
      success: true,
      id: application.id,
      message: "Application submitted successfully. We'll be in touch.",
    });
  } catch (error) {
    console.error("App apply error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
