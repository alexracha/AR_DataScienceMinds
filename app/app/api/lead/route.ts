import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { copy } from "@/lib/copy";
import { rateLimited } from "@/lib/ratelimit";
import { leadSchema } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: copy.form.errors.server }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: copy.form.errors.server }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return NextResponse.json({ ok: false, fields }, { status: 400 });
  }

  const lead = parsed.data;
  // Honeypot filled: pretend success so bots learn nothing.
  if (lead.website) return NextResponse.json({ ok: true });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      console.error("Lead NOT stored: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
      return NextResponse.json({ ok: false, error: copy.form.errors.server }, { status: 500 });
    }
    console.warn("[dev] Supabase not configured; lead logged only:", { ...lead, email: "***" });
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("leads").insert({
    name: lead.name,
    email: lead.email,
    company: lead.company,
    message: lead.message,
    team_size: lead.teamSize || null,
    budget: lead.budget || null,
    source: req.headers.get("referer") ?? null,
  });

  if (error) {
    console.error("Lead insert failed:", error.message);
    return NextResponse.json({ ok: false, error: copy.form.errors.server }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
