import { z } from "zod";
import { copy } from "./copy";

const e = copy.form.errors;

/** Hidden field bots fill in. Not "website"/"url": browsers autofill those and would drop real leads. */
export const HONEYPOT_FIELD = "alt_contact";

export const leadSchema = z.object({
  name: z.string().trim().min(1, e.name).max(120),
  email: z.string().trim().email(e.email).max(200),
  company: z.string().trim().min(1, e.company).max(160),
  message: z.string().trim().min(10, e.message).max(2000),
  teamSize: z.string().max(40).optional().or(z.literal("")),
  budget: z.string().max(40).optional().or(z.literal("")),
  [HONEYPOT_FIELD]: z.string().max(200).optional(), // any value means a bot (checked in the route)
});

export type LeadInput = z.infer<typeof leadSchema>;
