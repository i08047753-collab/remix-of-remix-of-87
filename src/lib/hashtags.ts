// Hashtags: "#" followed by Arabic/Latin letters, digits or underscore.
export const HASHTAG_RE = /#([\p{L}\p{N}_]{1,40})/gu;

export function normalizeTag(tag: string): string {
  return tag.replace(/^#/, "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
}

export function extractHashtags(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(HASHTAG_RE)) out.add(normalizeTag(m[1]!));
  return [...out];
}

export function popularTags(texts: string[], limit = 12): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of texts) for (const tag of extractHashtags(t)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, limit);
}

export function splitHashtags(text: string): { text: string; tag?: string }[] {
  const parts: { text: string; tag?: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(HASHTAG_RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ text: text.slice(last, i) });
    parts.push({ text: m[0], tag: normalizeTag(m[1]!) });
    last = i + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
