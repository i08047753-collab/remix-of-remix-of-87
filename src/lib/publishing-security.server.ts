import { timingSafeEqual } from 'node:crypto';
export function matchesPublishingCode(candidate: string, configured: string | undefined) {
  if (!configured || candidate.length > 256) return false;
  const a = new TextEncoder().encode(candidate);
  const b = new TextEncoder().encode(configured);
  return a.length === b.length && timingSafeEqual(a, b);
}
