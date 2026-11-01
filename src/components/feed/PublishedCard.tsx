import { Link } from '@tanstack/react-router';
import { CategoryChip, IntentBadge } from '@/components/common/Chips';
import { AttachmentList } from '@/components/common/AttachmentList';
import { PostSocial } from '@/components/feed/PostSocial';
import { categoryBySlug, intentByKey } from '@/data/catalog';
import type { ContentRecord } from '@/lib/publishing-rules';
import { splitHashtags } from '@/lib/hashtags';
import { useState } from 'react';
import { Flag, Trash2, Loader2 } from 'lucide-react';
import { ReportDialog } from '@/components/safety/SafetyMenu';
import { useIsAdmin } from '@/components/common/AdminAccess';
import { useServerFn } from '@tanstack/react-start';
import { deletePostByAdmin } from '@/lib/moderation.functions';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function ReportButton({ label, contentId }: { label: string; contentId: string }) {
  const [open, setOpen] = useState(false);
  const targetLabel = `[post:${contentId}] ${label}`;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="إبلاغ عن المنشور"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-destructive"
      >
        <Flag className="size-3.5" />
        إبلاغ
      </button>
      <ReportDialog open={open} onOpenChange={setOpen} targetLabel={targetLabel} />
    </>
  );
}

function AdminDeleteButton({ contentId }: { contentId: string }) {
  const { isAdmin } = useIsAdmin();
  const deletePost = useServerFn(deletePostByAdmin);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور كمشرف؟ سيتم حذفه نهائياً لجميع المستخدمين.')) return;
    setBusy(true);
    try {
      await deletePost({ data: { contentId } });
      toast.success('تم حذف المنشور بنجاح 🗑️');
      await queryClient.invalidateQueries({ queryKey: ['published-content'] });
    } catch {
      toast.error('تعذّر حذف المنشور.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleDelete}
      aria-label="حذف المنشور كمشرف"
      className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20 font-medium transition-colors"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      حذف كمشرف
    </button>
  );
}

export function TaggedText({ text }: { text: string }) {
  return (
    <>
      {splitHashtags(text).map((p, i) =>
        p.tag ? (
          <Link key={i} to="/explore" search={{ q: '#' + p.tag }} className="font-medium text-primary hover:underline">
            {p.text}
          </Link>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

export function PublishedCard({ content }: { content: ContentRecord }) {
  const cat = categoryBySlug(content.category);
  const intent = intentByKey(content.intent);
  return (
    <article className="surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        {cat && <CategoryChip slug={cat.slug} />}
        {intent && <IntentBadge intent={intent.key} />}
        <span className="text-xs text-muted-foreground">
          {content.kind === 'article' ? 'مقال' : 'منشور'} · {new Date(content.created_at).toLocaleDateString('ar-DZ')}
        </span>
        <div className="ms-auto flex items-center gap-1.5">
          <AdminDeleteButton contentId={content.id} />
          <ReportButton label={`المنشور: ${content.title}`} contentId={content.id} />
        </div>
      </div>
      <h2 className="mt-3 text-lg font-semibold">{content.title}</h2>
      <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">
        <TaggedText text={content.body} />
      </p>
      <AttachmentList attachments={content.attachments} />
      <PostSocial contentId={content.id} />
    </article>
  );
}
