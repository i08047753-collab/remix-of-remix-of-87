import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const id = z.string().uuid();
const admin = async () => (await import('@/integrations/supabase/client.server')).supabaseAdmin;

/** Public summary for one published post: likes, comments, author and follower count. */
export const getPostSocial = createServerFn({ method: 'POST' })
  .inputValidator((i: unknown) => z.object({ contentId: id, viewer: id.nullable() }).parse(i))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: post } = await db.from('publishing_content').select('owner_id,status').eq('id', data.contentId).maybeSingle();
    if (!post || post.status !== 'published') return null;
    const [likes, comments, author, followers] = await Promise.all([
      db.from('post_likes').select('user_id').eq('content_id', data.contentId),
      db.from('post_comments').select('id,username,body,created_at').eq('content_id', data.contentId).order('created_at').limit(100),
      db.from('account_usernames').select('username').eq('user_id', post.owner_id).maybeSingle(),
      db.from('follows').select('follower_id').eq('followee_id', post.owner_id),
    ]);
    const likeRows = likes.data ?? []; const followRows = followers.data ?? [];
    return {
      authorId: post.owner_id, author: author.data?.username ?? null,
      likes: likeRows.length, liked: !!data.viewer && likeRows.some(r => r.user_id === data.viewer),
      followers: followRows.length, following: !!data.viewer && followRows.some(r => r.follower_id === data.viewer),
      comments: comments.data ?? [],
    };
  });

export const toggleLike = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ contentId: id }).parse(i))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: post } = await db.from('publishing_content').select('status').eq('id', data.contentId).maybeSingle();
    if (post?.status !== 'published') throw new Error('المنشور غير متاح.');
    const { data: row } = await db.from('post_likes').select('user_id').eq('content_id', data.contentId).eq('user_id', context.userId).maybeSingle();
    if (row) await db.from('post_likes').delete().eq('content_id', data.contentId).eq('user_id', context.userId);
    else await db.from('post_likes').insert({ content_id: data.contentId, user_id: context.userId });
    return { liked: !row };
  });

export const addComment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ contentId: id, body: z.string().trim().min(1).max(500) }).parse(i))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: post } = await db.from('publishing_content').select('status').eq('id', data.contentId).maybeSingle();
    if (post?.status !== 'published') throw new Error('المنشور غير متاح.');
    const { data: u } = await db.from('account_usernames').select('username').eq('user_id', context.userId).maybeSingle();
    if (!u) throw new Error('الحساب غير مكتمل.');
    await db.from('post_comments').insert({ content_id: data.contentId, user_id: context.userId, username: u.username, body: data.body });
    return { ok: true };
  });

export const toggleFollow = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ userId: id }).parse(i))
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error('لا يمكنك متابعة نفسك.');
    const db = await admin();
    const { data: row } = await db.from('follows').select('follower_id').eq('follower_id', context.userId).eq('followee_id', data.userId).maybeSingle();
    if (row) await db.from('follows').delete().eq('follower_id', context.userId).eq('followee_id', data.userId);
    else await db.from('follows').insert({ follower_id: context.userId, followee_id: data.userId });
    return { following: !row };
  });
