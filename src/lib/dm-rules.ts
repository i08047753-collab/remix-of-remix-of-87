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
/** Turns free text into a safe username prefix (usernames are a-z, 0-9, _). */
export function memberSearchPrefix(input: string) {
  return input.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '').slice(0, 20);
}

export type DmConversation = { id: string; otherId: string; otherUsername: string; lastBody: string | null; lastSender: string | null; lastAt: string; unread: number; otherReadAt: string };
export type DmMessage = { id: string; sender_id: string; body: string; created_at: string };
export type DmThread = { id: string; otherId: string; otherUsername: string; otherReadAt: string; messages: DmMessage[]; hasMore: boolean };

export function mergeDmMessages(current: DmMessage[], incoming: DmMessage[]) {
  return [...new Map([...current, ...incoming].map(m => [m.id, m])).values()].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}
