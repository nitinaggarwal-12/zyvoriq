import { NextResponse } from "next/server";
import { createSupportTicket } from "@/lib/project-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const category = String(body.category || "general").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ ok: false, error: "Name, email, subject, and message are required." }, { status: 400 });
    }

    const ticket = await createSupportTicket({ name, email, category, subject, message });
    return NextResponse.json({ ok: true, ticket }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit support request";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
