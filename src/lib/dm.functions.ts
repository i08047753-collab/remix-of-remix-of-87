import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { dmDeleteSchema, dmSendSchema, dmThreadSchema, dmTranslateSchema, memberSearchPrefix, translationTarget, type DmConversation, type DmThread } from './dm-rules';

const failure = 'تعذّر إكمال الطلب. تحقق من اتصالك وحاول مجدداً.';
const fallbackName = (id: string) => `عضو ${id.slice(0, 6)}`;

// The sender/participant is always context.userId from the verified session; the
// browser never supplies a user id. Database functions are service_role-only.
export const searchMembers = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ query: z.string().max(40) }).parse(v))
  .handler(async ({ data, context }) => {
    const prefix = memberSearchPrefix(data.query);
    if (!prefix) return [] as { id: string; username: string }[];
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const rows = await supabaseAdmin.from('account_usernames').select('user_id, username')
      .ilike('username', `${prefix.replace(/_/g, '\\_')}%`).neq('user_id', context.userId).order('username').limit(10);
    if (rows.error) throw new Error(failure);
    return rows.data.map(r => ({ id: r.user_id, username: r.username }));
  });

export const startConversation = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ otherId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const result = await supabaseAdmin.rpc('dm_start', { p_user: context.userId, p_other: data.otherId });
    if (result.error || !result.data) {
      const msg = result.error?.message ?? '';
      throw new Error(msg.includes('DM_SELF') ? 'لا يمكنك مراسلة نفسك.' : msg.includes('DM_NO_USER') ? 'هذا العضو غير موجود.' : msg.includes('DM_RATE_LIMIT') ? 'بدأت محادثات كثيرة. حاول لاحقاً.' : failure);
    }
    return { id: result.data };
  });

export const listInbox = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const rows = await supabaseAdmin.rpc('dm_inbox', { p_user: context.userId });
    if (rows.error) throw new Error(failure);
    return (rows.data ?? []).map((r): DmConversation => ({
      id: r.id, otherId: r.other_id, otherUsername: r.other_username ?? fallbackName(r.other_id),
      lastBody: r.last_body, lastSender: r.last_sender, lastAt: r.last_at, unread: r.unread, otherReadAt: r.other_read_at,
      lastDeleted: !!r.last_deleted,
    }));
  });

export const listThread = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => dmThreadSchema.parse(v))
  .handler(async ({ data, context }) => {
    // Reads run as the signed-in user, so row security only returns conversations they belong to
    // and drops messages they deleted for themselves.
    const conv = await context.supabase.from('dm_conversations').select('id, user_a, user_b, read_a, read_b').eq('id', data.conversationId).maybeSingle();
    if (conv.error) throw new Error(failure);
    if (!conv.data) throw new Error('لا يمكنك الوصول إلى هذه المحادثة.');
    const c = conv.data;
    const mineA = c.user_a === context.userId;
    const otherId = mineA ? c.user_b : c.user_a;
    let query = context.supabase.from('dm_messages').select('id, sender_id, body, created_at, deleted_at').eq('conversation_id', c.id)
      .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(50);
    if (data.before) query = query.or(`created_at.lt.${data.before.time},and(created_at.eq.${data.before.time},id.lt.${data.before.id})`);
    const rows = await query;
    if (rows.error) throw new Error(failure);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [name] = await Promise.all([
      supabaseAdmin.from('account_usernames').select('username').eq('user_id', otherId).maybeSingle(),
      data.before ? Promise.resolve(null) : supabaseAdmin.rpc('dm_mark_read', { p_user: context.userId, p_conversation: c.id }),
    ]);
    const thread: DmThread = {
      id: c.id, otherId, otherUsername: name.data?.username ?? fallbackName(otherId), otherReadAt: mineA ? c.read_b : c.read_a,
      messages: (rows.data ?? []).reverse(), hasMore: (rows.data?.length ?? 0) === 50,
    };
    return thread;
  });

export const sendDirectMessage = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => dmSendSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const result = await supabaseAdmin.rpc('dm_send', { p_user: context.userId, p_conversation: data.conversationId, p_client: data.clientId, p_body: data.body });
    if (result.error || !result.data) {
      const msg = result.error?.message ?? '';
      throw new Error(msg.includes('DM_FORBIDDEN') ? 'لا يمكنك الإرسال في هذه المحادثة.' : msg.includes('DM_RATE_LIMIT') ? 'أرسلت رسائل كثيرة بسرعة. انتظر قليلاً.' : failure);
    }
    return { id: result.data };
  });

// The database function re-checks membership and that only the sender can delete for both members.
export const deleteDirectMessage = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => dmDeleteSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const result = await supabaseAdmin.rpc('dm_delete', { p_user: context.userId, p_message: data.messageId, p_scope: data.scope });
    if (result.error) {
      const msg = result.error.message;
      throw new Error(msg.includes('DM_NOT_OWNER') ? 'يمكنك حذف رسائلك أنت فقط لدى الطرفين.' : msg.includes('DM_FORBIDDEN') ? 'لا يمكنك حذف هذه الرسالة.' : failure);
    }
    return { ok: true };
  });

export const translateDirectMessage = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => dmTranslateSchema.parse(v))
  .handler(async ({ data, context }) => {
    // Read as the signed-in user: only members of the conversation can translate a message.
    const row = await context.supabase.from('dm_messages').select('body, deleted_at').eq('id', data.messageId).maybeSingle();
    if (row.error) throw new Error(failure);
    if (!row.data) throw new Error('لا يمكنك ترجمة هذه الرسالة.');
    if (row.data.deleted_at || !row.data.body.trim()) throw new Error('هذه الرسالة محذوفة.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const allowed = await supabaseAdmin.rpc('auth_rate_allowed', { p_kind: 'dm_translate', p_key: context.userId, p_limit: 30, p_window_seconds: 600 });
    if (allowed.error) throw new Error(failure);
    if (!allowed.data) throw new Error('طلبت ترجمات كثيرة. حاول بعد قليل.');
    await supabaseAdmin.rpc('auth_rate_record', { p_kind: 'dm_translate', p_key: context.userId });
    const target = translationTarget(row.data.body);
    const { translateText, TranslateError } = await import('./dm-translate.server');
    try {
      return { text: await translateText(row.data.body, target), target };
    } catch (e) {
      const status = e instanceof TranslateError ? e.status : 500;
      throw new Error(status === 429 ? 'خدمة الترجمة مشغولة الآن. حاول بعد قليل.' : status === 402 || status === 403 ? 'الترجمة غير متاحة حالياً.' : 'تعذّرت الترجمة. حاول مجدداً.');
    }
  });
