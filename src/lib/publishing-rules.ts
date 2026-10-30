import { z } from 'zod';
import { CATEGORIES, INTENTS } from '@/data/catalog';

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
export const MAX_ATTACHMENTS = 3;
export const SUBMISSION_INTERVAL_SECONDS = 60;
export const FAILED_CODE_LIMIT = 5;
export const CODE_WINDOW_SECONDS = 15 * 60;
export const FILE_ACCEPT = '.jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf';
export const ATTACHMENT_TYPES = ['image/jpeg','image/png','image/webp','video/mp4','video/webm','application/pdf'] as const;
export const EXT_BY_TYPE: Record<string,string> = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','application/pdf':'pdf'};
export const attachmentSchema = z.object({ name: z.string().min(1).max(120), path: z.string().max(240), type: z.enum(ATTACHMENT_TYPES), size: z.number().int().positive().max(MAX_VIDEO_BYTES) });
export type Attachment = z.infer<typeof attachmentSchema>;
export const contentSchema = z.object({
  kind: z.enum(['post','article']), title: z.string().trim().min(5).max(120),
  body: z.string().trim().min(20).max(20000),
  category: z.string().refine(v => CATEGORIES.some(c => c.slug === v)),
  intent: z.string().refine(v => INTENTS.some(i => i.key === v)),
}).superRefine((v,c) => { if (v.kind === 'post' && v.body.length > 2000) c.addIssue({ code: 'custom', path: ['body'], message: 'POST_TOO_LONG' }); });
export function validateFileMetadata(file: {name: string; size: number; type: string}) {
  const limit = file.type.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_FILE_BYTES;
  if (file.size <= 0 || file.size > limit) return 'حجم الصورة أو الملف حتى 5 MB، والفيديو حتى 20 MB.';
  const ext = file.name.split('.').at(-1)?.toLowerCase();
  const allowed: Record<string,string> = {jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4',webm:'video/webm',pdf:'application/pdf'};
  if (!ext || allowed[ext] !== file.type) return 'الملفات المدعومة: JPG، PNG، WebP، MP4، WebM، PDF فقط.';
  return null;
}
export function validateFileBytes(bytes: Uint8Array, type: string) {
  const starts = (s: number[]) => s.every((b,i) => bytes[i] === b);
  if (type === 'image/jpeg') return starts([255,216,255]) && bytes.at(-2) === 255 && bytes.at(-1) === 217;
  if (type === 'image/png') return starts([137,80,78,71,13,10,26,10]) && bytes.length >= 24;
  if (type === 'image/webp') return starts([82,73,70,70]) && [87,69,66,80].every((b,i) => bytes[i+8] === b);
  if (type === 'video/mp4') return bytes.length >= 24 && new TextDecoder().decode(bytes.slice(4,8)) === 'ftyp' && /^(isom|iso[2-9]|mp4[12]|avc1|M4V |dash|mp42|qt  )/.test(new TextDecoder().decode(bytes.slice(8,12)));
  if (type === 'video/webm') return starts([26,69,223,163]) && new TextDecoder().decode(bytes.slice(0,512)).includes('webm');
  if (type === 'application/pdf') {
    if (!starts([37,80,68,70,45])) return false;
    const text = new TextDecoder('latin1').decode(bytes);
    return text.includes('%%EOF') && !/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA)\b/i.test(text);
  }
  return false;
}
export type ContentRecord = {id:string; owner_id:string; kind:string; title:string; body:string; category:string; intent:string; status:string; note:string; created_at:string; attachments:Attachment[]};
