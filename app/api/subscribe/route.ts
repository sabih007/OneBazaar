import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendNewsletterSignupEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email("Enter a valid email") });

/** Receives a newsletter signup from the footer and forwards it to the team. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const delivered = await sendNewsletterSignupEmail(parsed.data.email);
    return NextResponse.json({ ok: true, delivered });
  } catch (err) {
    console.error("[api/subscribe]", err);
    return NextResponse.json(
      { error: "Could not subscribe right now. Please try again." },
      { status: 500 }
    );
  }
}
