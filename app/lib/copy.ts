import raw from "@/content/copy.json";

export const copy = raw;
export type Copy = typeof raw;
export type FormField = Copy["form"]["fields"][number] & { options?: string[] };
