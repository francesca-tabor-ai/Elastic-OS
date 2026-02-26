import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = "info@francescatabor.com";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Email is not configured. Add RESEND_API_KEY to .env. Get a key at resend.com",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { name, email, requestType, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? "ElasticOS <onboarding@resend.dev>";

    const requestTypeLabel =
      requestType === "bug_report" ? "Bug Report" : "Customer Support Request";

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: TO_EMAIL,
      replyTo: email,
      subject: `[${requestTypeLabel}] ${subject}`,
      html: `
        <h2>Contact form submission</h2>
        <p><strong>Request type:</strong> ${requestTypeLabel}</p>
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <pre style="white-space: pre-wrap; font-family: inherit;">${message}</pre>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sent to ${TO_EMAIL}`,
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
