"use client";

import { useState } from "react";
import { copy, type FormField } from "@/lib/copy";
import { leadSchema } from "@/lib/schema";
import { track } from "@/lib/track";
import { Txt } from "./ui";

type Status = "idle" | "sending" | "success" | "error";

export function LeadForm() {
  const { form } = copy;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [started, setStarted] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
      setErrors(fields);
      return;
    }
    setErrors({});
    setServerError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        track("form_submit");
        setStatus("success");
        return;
      }
      if (json.fields) setErrors(json.fields);
      setServerError(json.error ?? (json.fields ? "" : form.errors.server));
      setStatus("error");
    } catch {
      setServerError(form.errors.server);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl bg-white p-8 text-ink">
        <p className="text-2xl font-bold">✓ You&apos;re in.</p>
        <p className="mt-3 text-muted">{form.success}</p>
      </div>
    );
  }

  const input =
    "mt-1 block w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/70";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      onChange={(e) => {
        const { name } = e.target as unknown as { name: string };
        if (errors[name]) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== name)));
      }}
      onFocus={() => {
        if (!started) {
          setStarted(true);
          track("form_start");
        }
      }}
      className="rounded-2xl bg-white p-6 text-ink shadow-xl sm:p-8"
      aria-label="Free AI opportunity audit request"
    >
      <div className="space-y-5">
        {(form.fields as FormField[]).map((f) => {
          const err = errors[f.name];
          const common = {
            id: f.name,
            name: f.name,
            required: f.required,
            "aria-invalid": err ? true : undefined,
            "aria-describedby": err ? `${f.name}-err` : undefined,
            className: input,
          };
          return (
            <div key={f.name}>
              <label htmlFor={f.name} className="text-sm font-semibold">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea {...common} rows={4} placeholder={f.placeholder} />
              ) : f.type === "select" ? (
                <select {...common} defaultValue="">
                  <option value="">Select…</option>
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input {...common} type={f.type} placeholder={f.placeholder} autoComplete={f.name === "email" ? "email" : f.name === "company" ? "organization" : f.name === "name" ? "name" : undefined} />
              )}
              {err && <p id={`${f.name}-err`} role="alert" className="mt-1 text-sm text-red-700">{err}</p>}
            </div>
          );
        })}
        {/* Honeypot: hidden from people and assistive tech, bots fill it */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
      </div>
      {serverError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{serverError}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 min-h-12 w-full rounded-lg bg-accent px-6 py-3 text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : form.submit}
      </button>
      <p className="mt-3 text-xs text-muted"><Txt>{form.consent}</Txt></p>
    </form>
  );
}
