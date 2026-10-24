import type { CategorySlug, IntentKey } from "@/data/catalog";
import type { Submission } from "@/data/sample";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const BIO_MAX = 160;

/** Usernames are compared lowercase so "Lina" and "lina" are the same handle. */
export const normalizeUsername = (raw: string) => raw.trim().toLowerCase();

export type UsernameCheck = { ok: true; value: string } | { ok: false; error: string };

export function validateUsername(raw: string, taken: string[] = []): UsernameCheck {
  const value = normalizeUsername(raw);
  if (value.length < USERNAME_MIN) return { ok: false, error: `اسم المستخدم ${USERNAME_MIN} أحرف على الأقل` };
  if (value.length > USERNAME_MAX) return { ok: false, error: `اسم المستخدم ${USERNAME_MAX} حرفاً كحد أقصى` };
  if (!/^[a-z0-9_]+$/.test(value))
    return { ok: false, error: "استخدم حروفاً إنجليزية وأرقاماً والشرطة السفلية _ فقط" };
  if (taken.map(normalizeUsername).includes(value)) return { ok: false, error: "هذا الاسم مستخدم، جرّب اسماً آخر" };
  return { ok: true, value };
}

export function validateBio(bio: string): string | null {
  if (bio.length > BIO_MAX) return `النبذة ${BIO_MAX} حرفاً كحد أقصى`;
  return null;
}

/** Members never publish directly: every new submission starts as pending review. */
export function createSubmission(input: {
  title: string;
  body: string;
  category: CategorySlug;
  intent: IntentKey;
}): Submission {
  return {
    id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: input.title.trim(),
    body: input.body.trim(),
    category: input.category,
    intent: input.intent,
    status: "pending",
    submittedAt: "الآن",
  };
}
