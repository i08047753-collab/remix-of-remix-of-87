import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { addComment, getPostSocial, toggleFollow, toggleLike } from '@/lib/social.functions';
import { cn } from '@/lib/utils';

export function PostSocial({ contentId }: { contentId: string }) {
  const { user } = useAuth(); const qc = useQueryClient();
  const fetchSocial = useServerFn(getPostSocial); const like = useServerFn(toggleLike);
  const comment = useServerFn(addComment); const follow = useServerFn(toggleFollow);
  const key = ['post-social', contentId, user?.id ?? null];
  const { data } = useQuery({ queryKey: key, queryFn: () => fetchSocial({ data: { contentId, viewer: user?.id ?? null } }) });
  const [open, setOpen] = useState(false); const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['post-social', contentId] });
  const needAuth = () => { toast('سجّل الدخول أولاً', { action: { label: 'دخول', onClick: () => { window.location.href = '/auth'; } } }); };
  const run = async (fn: () => Promise<unknown>) => {
    if (!user) return needAuth();
    setBusy(true);
    try { await fn(); await refresh(); } catch { toast.error('تعذّر إكمال الطلب.'); } finally { setBusy(false); }
  };
  if (!data) return null;
  const isMe = user?.id === data.authorId;
  return <div className="mt-4 border-t border-border pt-3">
    {data.author && <div className="mb-2 flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground" dir="ltr">@{data.author} · {data.followers} مشترك</span>
      {!isMe && <button type="button" disabled={busy} onClick={() => run(() => follow({ data: { userId: data.authorId } }))}
        className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', data.following ? 'bg-accent text-foreground' : 'bg-primary text-primary-foreground')}>
        {data.following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}{data.following ? 'مشترك' : 'اشتراك'}
      </button>}
    </div>}
    <div className="flex items-center gap-1 text-sm">
      <button type="button" disabled={busy} aria-pressed={data.liked} onClick={() => run(() => like({ data: { contentId } }))}
        className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-accent', data.liked ? 'text-primary' : 'text-muted-foreground')}>
        <Heart className={cn('size-4', data.liked && 'fill-current')} />{data.likes}<span className="sr-only">إعجاب</span>
      </button>
      <button type="button" onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent">
        <MessageCircle className="size-4" />{data.comments.length} تعليق
      </button>
    </div>
    {open && <div className="mt-3 space-y-2">
      {data.comments.map(c => <div key={c.id} className="rounded-lg bg-muted/50 p-2.5 text-sm">
        <span className="font-semibold" dir="ltr">@{c.username}</span>
        <p className="mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
      </div>)}
      {user ? <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const body = text.trim(); if (!body) return; void run(async () => { await comment({ data: { contentId, body } }); setText(''); }); }}>
        <input value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder="اكتب تعليقاً..." className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button type="submit" disabled={busy || !text.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">نشر</button>
      </form> : <p className="text-sm text-muted-foreground"><Link to="/auth" className="text-primary">سجّل الدخول</Link> لكتابة تعليق.</p>}
    </div>}
  </div>;
}
