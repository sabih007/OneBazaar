import { NextRequest, NextResponse } from "next/server";
import { partnerApplicationSchema } from "@/lib/validations/partner";
import { sendPartnerApplicationEmail } from "@/lib/email";

/** Receives a "Become Our Partner" application and forwards it to the team. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = partnerApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
        { status: 400 }
      );
    }

    const delivered = await sendPartnerApplicationEmail(parsed.data);
    return NextResponse.json({ ok: true, delivered });
  } catch (err) {
    console.error("[api/partner]", err);
    return NextResponse.json(
      { error: "Could not submit your application. Please try again." },
      { status: 500 }
    );
  }
}
