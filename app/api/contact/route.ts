import { NextRequest, NextResponse } from "next/server";
import { contactMessageSchema } from "@/lib/validations/contact";
import { sendContactMessageEmail } from "@/lib/email";

/** Receives a message from the /contact page and forwards it to support. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = contactMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
        { status: 400 }
      );
    }

    const delivered = await sendContactMessageEmail(parsed.data);
    return NextResponse.json({ ok: true, delivered });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }
}
