import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (!data) throw new Error('Forbidden');
}

export const submitReport = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const v = (input ?? {}) as Record<string, unknown>;
    const r = { targetLabel: text(v['targetLabel'], 200), targetUsername: text(v['targetUsername'], 40), reason: text(v['reason'], 120), note: text(v['note'], 300) };
    if (!r.targetLabel || !r.reason) throw new Error('بيانات البلاغ غير مكتملة');
    return r;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { count } = await supabaseAdmin.from('content_reports').select('id', { count: 'exact', head: true }).eq('reporter_id', context.userId).gte('created_at', new Date(Date.now() - 3600_000).toISOString());
    if ((count ?? 0) >= 10) throw new Error('أرسلت بلاغات كثيرة، حاول لاحقاً');
    const { error } = await supabaseAdmin.from('content_reports').insert({ reporter_id: context.userId, target_label: data.targetLabel, target_username: data.targetUsername || null, reason: data.reason, note: data.note });
    if (error) throw new Error('تعذّر إرسال البلاغ');
    return { ok: true };
 export const listReports = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data } = await supabaseAdmin
      .from('content_reports')
      .select('*')
      .in('status', ['open', 'pending'])
      .order('created_at', { ascending: false })
      .limit(100);
    return data ?? [];
  });

export const closeReport = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: 'dismissed' | 'actioned' }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    await supabaseAdmin.from('content_reports').update({ status: data.status === 'actioned' ? 'actioned' : 'dismissed' }).eq('id', data.id);
    return { ok: true };
  });

export const deletePostByAdmin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { contentId: string; reportId?: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('publishing_content').delete().eq('id', data.contentId);
    if (error) throw new Error('تعذّر حذف المنشور.');
    
    // إغلاق البلاغ المحدد إن وُجد
    if (data.reportId) {
      await supabaseAdmin.from('content_reports').update({ status: 'actioned' }).eq('id', data.reportId);
    }
    // وإغلاق أي بلاغ آخر يخص هذا المنشور تلقائياً
    await supabaseAdmin
      .from('content_reports')
      .update({ status: 'actioned' })
      .ilike('target_label', `%[post:${data.contentId}]%`);

    return { ok: true };
  });

export const listMembers = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [users, roles] = await Promise.all([
      supabaseAdmin.from('account_usernames').select('user_id, username, created_at').order('created_at', { ascending: false }),
      supabaseAdmin.from('user_roles').select('user_id, role'),
    ]);
    return (users.data ?? []).map((u) => ({ username: u.username, joined: u.created_at, admin: (roles.data ?? []).some((r) => r.user_id === u.user_id && r.role === 'admin') }));
  });
