import { z } from 'zod';
import { validateFileBytes } from './publishing-rules';

export const CHAT_MAX_BYTES = 20 * 1024 * 1024;
export const CHAT_ACCEPT = '.jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf,.txt';
const types: Record<string, string> = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', mp4:'video/mp4', webm:'video/webm', pdf:'application/pdf', txt:'text/plain' };
export const chatFileSchema = z.object({ name:z.string().min(1).max(120), size:z.number().int().positive().max(CHAT_MAX_BYTES), type:z.string() }).refine(f => types[f.name.split('.').at(-1)?.toLowerCase() ?? ''] === f.type);
export const chatSendSchema = z.object({ clientId:z.string().uuid(), body:z.string().trim().max(4000), attachmentId:z.string().uuid().nullable() }).refine(v => v.body.length > 0 || v.attachmentId !== null);
export function validateChatBytes(bytes:Uint8Array, type:string) {
  if (bytes.length === 0 || bytes.length > CHAT_MAX_BYTES) return false;
  if (type.startsWith('image/') || type === 'application/pdf') return validateFileBytes(bytes,type);
  if (type === 'video/mp4') return bytes.length >= 24 && new TextDecoder().decode(bytes.slice(4,8)) === 'ftyp' && /^(isom|iso[2-9]|mp4[12]|avc1|M4V |dash)/.test(new TextDecoder().decode(bytes.slice(8,12)));
  if (type === 'video/webm') return [26,69,223,163].every((b,i)=>bytes[i]===b) && new TextDecoder().decode(bytes.slice(0,512)).includes('webm');
  if (type === 'text/plain') { try { const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes); return !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text); } catch { return false; } }
  return false;
}
export type ChatAttachment = { id:string; name:string; type:string; size:number; url:string; downloadUrl:string };
export type ChatMessage = { id:string; sender_id:string; client_id:string; username:string; avatar_url:string|null; body:string; created_at:string; attachment:ChatAttachment|null };
export function mergeChatMessages(current:ChatMessage[], incoming:ChatMessage[]) {
  return [...new Map([...current,...incoming].map(m=>[m.id,m])).values()].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));
}
export function fileSize(size:number) { return size < 1048576 ? `${(size/1024).toFixed(1)} KB` : `${(size/1048576).toFixed(1)} MB`; }