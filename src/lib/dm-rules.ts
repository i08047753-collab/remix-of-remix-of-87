import { z } from 'zod';

export const DM_MAX_LENGTH = 2000;
export const dmSendSchema = z.object({
  conversationId: z.string().uuid(),
  clientId: z.string().uuid(),
  body: z.string().trim().min(1).max(DM_MAX_LENGTH),
});
export const dmThreadSchema = z.object({
  conversationId: z.string().uuid(),
  before: z.object({ time: z.string().datetime({ offset: true }), id: z.string().uuid() }).optional(),
});
/** "me" hides the message only for the caller; "everyone" wipes its text for both members (sender only). */
export const dmDeleteSchema = z.object({ messageId: z.string().uuid(), scope: z.enum(['me', 'everyone']) });
export const dmTranslateSchema = z.object({ messageId: z.string().uuid() });
/** Only the sender may delete a message for both members, and only once. */
export function canDeleteForEveryone(message: Pick<DmMessage, 'sender_id' | 'deleted_at'>, userId: string) {
  return message.sender_id === userId && !message.deleted_at;
}
/** Arabic text is translated to English; anything else is translated to Arabic. */
export function translationTarget(text: string): 'ar' | 'en' {
  const arabic = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return arabic > 0 && arabic >= latin ? 'en' : 'ar';
}
/** Turns free text into a safe username prefix (usernames are a-z, 0-9, _). */
export function memberSearchPrefix(input: string) {
  return input.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '').slice(0, 20);
}

export type DmConversation = { id: string; otherId: string; otherUsername: string; lastBody: string | null; lastSender: string | null; lastAt: string; unread: number; otherReadAt: string; lastDeleted: boolean };
export type DmMessage = { id: string; sender_id: string; body: string; created_at: string; deleted_at: string | null };
export type DmThread = { id: string; otherId: string; otherUsername: string; otherReadAt: string; messages: DmMessage[]; hasMore: boolean };

export function mergeDmMessages(current: DmMessage[], incoming: DmMessage[]) {
  return [...new Map([...current, ...incoming].map(m => [m.id, m])).values()].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}
