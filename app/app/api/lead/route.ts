import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { copy } from "@/lib/copy";
import { rateLimited } from "@/lib/ratelimit";
import { HONEYPOT_FIELD, fieldErrors, leadSchema } from "@/lib/schema";

export const runtime = "nodejs";

const fail = (status: number) =>
  NextResponse.json({ ok: false, error: copy.form.errors.server }, { status });

const MAX_BODY_BYTES = 10_000; // a lead is well under 3 KB; anything bigger is abuse

/** Reads the body but stops as soon as it exceeds the cap. Returns null if too large. */
async function readLimited(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > max) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return fail(429);
  }

  const text = await readLimited(req, MAX_BODY_BYTES);
  if (text === null) {
    return fail(413);
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail(400);
  }

  // Honeypot filled: pretend success so bots learn nothing. Log (no personal data)
  // so a wrongly-caught real person shows up as a spike instead of vanishing.
  const trap = (body as Record<string, unknown> | null)?.[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.length > 0) {
    console.warn("[honeypot] submission dropped");
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, fields: fieldErrors(parsed.error) }, { status: 400 });
  }

  const lead = parsed.data;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      console.error("Lead NOT stored: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
      return fail(500);
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
    return fail(500);
  }
  return NextResponse.json({ ok: true });
}
