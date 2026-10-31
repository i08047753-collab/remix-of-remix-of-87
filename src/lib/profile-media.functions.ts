import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { MAX_FILE_BYTES, validateFileBytes } from './publishing-rules';

export type ProfileMedia = { avatarUrl: string | null; coverUrl: string | null };
type Kind = 'avatar' | 'cover';
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const BUCKET = 'profile-media';

async function signed(paths: { avatar_path: string | null; cover_path: string | null } | null): Promise<ProfileMedia> {
  if (!paths) return { avatarUrl: null, coverUrl: null };
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const sign = async (p: string | null) => {
    if (!p) return null;
    const r = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(p, 3600);
    return r.data?.signedUrl ?? null;
  };
  const [avatarUrl, coverUrl] = await Promise.all([sign(paths.avatar_path), sign(paths.cover_path)]);
  return { avatarUrl, coverUrl };
}

/** Public: profile pictures are visible to every visitor, like any social profile. */
export const getProfileMedia = createServerFn({ method: 'GET' })
  .inputValidator((input: { username: string }) => ({ username: String(input?.username ?? '').toLowerCase().slice(0, 40) }))
  .handler(async ({ data }): Promise<ProfileMedia> => {
    if (!/^[a-z0-9_]{3,20}$/.test(data.username)) return { avatarUrl: null, coverUrl: null };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const map = await supabaseAdmin.from('account_usernames').select('user_id').eq('username', data.username).maybeSingle();
    if (!map.data) return { avatarUrl: null, coverUrl: null };
    const row = await supabaseAdmin.from('profile_media').select('avatar_path,cover_path').eq('user_id', map.data.user_id).maybeSingle();
    return signed(row.data);
  });

export const getMyProfileMedia = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProfileMedia & { username: string | null }> => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [map, row] = await Promise.all([
      supabaseAdmin.from('account_usernames').select('username').eq('user_id', context.userId).maybeSingle(),
      supabaseAdmin.from('profile_media').select('avatar_path,cover_path').eq('user_id', context.userId).maybeSingle(),
    ]);
    return { ...(await signed(row.data)), username: map.data?.username ?? null };
  });

export const uploadProfileImage = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) throw new Error('بيانات غير صالحة');
    const kind = input.get('kind'); const file = input.get('file');
    if ((kind !== 'avatar' && kind !== 'cover') || !(file instanceof File)) throw new Error('بيانات غير صالحة');
    return { kind: kind as Kind, file };
  })
  .handler(async ({ data, context }): Promise<{ ok: boolean; error?: string }> => {
    const ext = IMAGE_TYPES[data.file.type];
    if (!ext) return { ok: false, error: 'الصيغ المدعومة: JPG، PNG، WebP فقط.' };
    if (data.file.size <= 0 || data.file.size > MAX_FILE_BYTES) return { ok: false, error: 'الحد الأقصى لحجم الصورة 5 MB.' };
    const bytes = new Uint8Array(await data.file.arrayBuffer());
    if (!validateFileBytes(bytes, data.file.type)) return { ok: false, error: 'الملف ليس صورة صالحة.' };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const path = `${context.userId}/${data.kind}-${crypto.randomUUID()}.${ext}`;
    const up = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, { contentType: data.file.type });
    if (up.error) return { ok: false, error: 'تعذّر رفع الصورة، حاول مجدداً.' };
    const col = data.kind === 'avatar' ? 'avatar_path' : 'cover_path';
    const prev = await supabaseAdmin.from('profile_media').select(col).eq('user_id', context.userId).maybeSingle();
    const save = await supabaseAdmin.from('profile_media').upsert({ user_id: context.userId, [col]: path, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (save.error) { await supabaseAdmin.storage.from(BUCKET).remove([path]); return { ok: false, error: 'تعذّر حفظ الصورة.' }; }
    const old = (prev.data as Record<string, string | null> | null)?.[col];
    if (old) await supabaseAdmin.storage.from(BUCKET).remove([old]);
    return { ok: true };
  });

export const removeProfileImage = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { kind: Kind }) => {
    if (input?.kind !== 'avatar' && input?.kind !== 'cover') throw new Error('بيانات غير صالحة');
    return { kind: input.kind };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const col = data.kind === 'avatar' ? 'avatar_path' : 'cover_path';
    const prev = await supabaseAdmin.from('profile_media').select(col).eq('user_id', context.userId).maybeSingle();
    const old = (prev.data as Record<string, string | null> | null)?.[col];
    if (!old) return { ok: true };
    await supabaseAdmin.from('profile_media').update({ [col]: null, updated_at: new Date().toISOString() }).eq('user_id', context.userId);
    await supabaseAdmin.storage.from(BUCKET).remove([old]);
    return { ok: true };
  });
