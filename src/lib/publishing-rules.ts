import { z } from 'zod';
import { CATEGORIES, INTENTS } from '@/data/catalog';

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS = 3;
export const SUBMISSION_INTERVAL_SECONDS = 60;
export const FAILED_CODE_LIMIT = 5;
export const CODE_WINDOW_SECONDS = 15 * 60;
export const FILE_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';
export const attachmentSchema = z.object({ name: z.string().min(1).max(120), path: z.string().max(240), type: z.enum(['image/jpeg','image/png','image/webp','application/pdf']), size: z.number().int().positive().max(MAX_FILE_BYTES) });
export type Attachment = z.infer<typeof attachmentSchema>;
export const contentSchema = z.object({
  kind: z.enum(['post','article']), title: z.string().trim().min(5).max(120),
  body: z.string().trim().min(20).max(20000),
  category: z.string().refine(v => CATEGORIES.some(c => c.slug === v)),
  intent: z.string().refine(v => INTENTS.some(i => i.key === v)),
}).superRefine((v,c) => { if (v.kind === 'post' && v.body.length > 2000) c.addIssue({ code: 'custom', path: ['body'], message: 'POST_TOO_LONG' }); });
export function validateFileMetadata(file: {name: string; size: number; type: string}) {
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) return 'حجم الملف يجب أن يكون أكبر من صفر وألا يتجاوز 5 MB.';
  const ext = file.name.split('.').at(-1)?.toLowerCase();
  const allowed: Record<string,string> = {jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',pdf:'application/pdf'};
  if (!ext || allowed[ext] !== file.type) return 'الملفات المدعومة: JPG، PNG، WebP، PDF فقط.';
  return null;
}
export function validateFileBytes(bytes: Uint8Array, type: string) {
  const starts = (s: number[]) => s.every((b,i) => bytes[i] === b);
  if (type === 'image/jpeg') return starts([255,216,255]) && bytes.at(-2) === 255 && bytes.at(-1) === 217;
  if (type === 'image/png') return starts([137,80,78,71,13,10,26,10]) && bytes.length >= 24;
  if (type === 'image/webp') return starts([82,73,70,70]) && [87,69,66,80].every((b,i) => bytes[i+8] === b);
  if (type === 'application/pdf') {
    if (!starts([37,80,68,70,45])) return false;
    const text = new TextDecoder('latin1').decode(bytes);
    return text.includes('%%EOF') && !/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA)\b/i.test(text);
  }
  return false;
}
export type ContentRecord = {id:string; owner_id:string; kind:string; title:string; body:string; category:string; intent:string; status:string; note:string; created_at:string; attachments:Attachment[]};
