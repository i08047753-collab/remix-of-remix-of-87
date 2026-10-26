import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCheck, Check, LoaderCircle, MessageCircle, Search, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { DM_MAX_LENGTH, mergeDmMessages, type DmMessage } from '@/lib/dm-rules';
import { listInbox, listThread, searchMembers, sendDirectMessage, startConversation } from '@/lib/dm.functions';
import { cn } from '@/lib/utils';

const timeFmt = new Intl.DateTimeFormat('ar', { hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short' });
function shortTime(iso: string) {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString() ? timeFmt.format(d) : dayFmt.format(d);
}

export function DirectMessages({ activeId }: { activeId?: string }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchInbox = useServerFn(listInbox);
  const inbox = useQuery({ queryKey: ['dm-inbox', user?.id], queryFn: () => fetchInbox(), enabled: !!user, refetchInterval: 30000 });

  useEffect(() => {
    if (!user) return;
    // Row security means each member only receives inserts from their own conversations.
    const channel = supabase.channel(`dm-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dm_messages' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['dm-inbox'] });
        void queryClient.invalidateQueries({ queryKey: ['dm-thread'] });
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  if (!ready) return <Shell><Centered><LoaderCircle className="size-7 animate-spin text-primary" /></Centered></Shell>;
  if (!user) return <Shell><Centered>
    <MessageCircle className="size-14 text-primary" />
    <h2 className="text-xl font-semibold">رسائلك الخاصة</h2>
    <p className="max-w-xs text-sm text-muted-foreground">سجّل دخولك لمراسلة أعضاء STORM WORLD بشكل خاص.</p>
    <Button asChild variant="hero"><Link to="/auth">تسجيل الدخول</Link></Button>
  </Centered></Shell>;

  const open = (id: string) => void navigate({ to: '/messages', search: { c: id } });
  const active = inbox.data?.find(c => c.id === activeId);

  return <Shell>
    <aside className={cn('flex min-h-0 flex-col border-border md:border-e', activeId ? 'hidden md:flex' : 'flex')}>
      <MemberSearch onOpen={open} />
      <ul className="min-h-0 flex-1 overflow-y-auto" aria-label="المحادثات">
        {inbox.isLoading && <li className="p-6 text-center text-sm text-muted-foreground">جارٍ التحميل…</li>}
        {inbox.isError && <li className="p-6 text-center text-sm text-destructive">تعذّر تحميل المحادثات.</li>}
        {inbox.data?.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">لا توجد محادثات بعد. ابحث عن عضو لبدء محادثة.</li>}
        {inbox.data?.map(c => <li key={c.id}>
          <button type="button" onClick={() => open(c.id)} aria-current={c.id === activeId ? 'true' : undefined}
            className={cn('flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-accent/60', c.id === activeId && 'bg-accent')}>
            <MemberAvatar name={c.otherUsername} seed={c.otherId} className="size-11" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className={cn('truncate text-sm', c.unread ? 'font-bold' : 'font-medium')}>{c.otherUsername}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{shortTime(c.lastAt)}</span>
              </span>
              <span className="mt-0.5 flex items-center gap-2">
                <span className={cn('min-w-0 flex-1 truncate text-xs', c.unread ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                  {c.lastBody ? `${c.lastSender === user.id ? 'أنت: ' : ''}${c.lastBody}` : 'محادثة جديدة'}
                </span>
                {c.unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground" aria-label={`${c.unread} رسائل غير مقروءة`}>{c.unread > 99 ? '99+' : c.unread}</span>}
              </span>
            </span>
          </button>
        </li>)}
      </ul>
    </aside>
    <div className={cn('min-h-0 flex-col', activeId ? 'flex' : 'hidden md:flex')}>
      {activeId ? <Thread key={activeId} id={activeId} fallbackName={active?.otherUsername} userId={user.id} /> : <Centered>
        <MessageCircle className="size-12 text-primary" />
        <p className="text-sm text-muted-foreground">اختر محادثة أو ابحث عن عضو لبدء محادثة جديدة.</p>
      </Centered>}
    </div>
  </Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl">
    <h1 className="mb-5 text-2xl font-bold sm:text-3xl">الرسائل</h1>
    <section aria-label="الرسائل الخاصة" className="grid h-[calc(100dvh-14rem)] min-h-[440px] max-h-[860px] overflow-hidden rounded-2xl border border-border bg-card/80 shadow-card md:h-[calc(100dvh-13rem)] md:grid-cols-[320px_minmax(0,1fr)]">
      {children}
    </section>
  </div>;
}
function Centered({ children }: { children: React.ReactNode }) {
  return <div className="col-span-full flex h-full flex-col items-center justify-center gap-4 p-6 text-center">{children}</div>;
}

function MemberSearch({ onOpen }: { onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [error, setError] = useState('');
  const [starting, setStarting] = useState<string | null>(null);
  const search = useServerFn(searchMembers);
  const start = useServerFn(startConversation);
  useEffect(() => { const t = setTimeout(() => setDebounced(query.trim()), 250); return () => clearTimeout(t); }, [query]);
  const results = useQuery({ queryKey: ['dm-search', debounced], queryFn: () => search({ data: { query: debounced } }), enabled: debounced.length > 0 });
  const begin = async (id: string) => {
    setStarting(id); setError('');
    try { const r = await start({ data: { otherId: id } }); setQuery(''); setDebounced(''); onOpen(r.id); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذّر بدء المحادثة.'); }
    finally { setStarting(null); }
  };
  return <div className="relative border-b border-border p-3">
    <div className="relative">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={query} onChange={e => setQuery(e.target.value)} maxLength={40} placeholder="ابحث عن عضو باسم المستخدم" aria-label="ابحث عن عضو" className="h-10 ps-9" dir="auto" />
      {query && <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 size-8 -translate-y-1/2" aria-label="مسح البحث" onClick={() => { setQuery(''); setDebounced(''); }}><X className="size-4" /></Button>}
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    {debounced && <ul className="absolute inset-x-3 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-card">
      {results.isLoading && <li className="p-3 text-sm text-muted-foreground">جارٍ البحث…</li>}
      {results.data?.length === 0 && <li className="p-3 text-sm text-muted-foreground">لا يوجد أعضاء بهذا الاسم.</li>}
      {results.isError && <li className="p-3 text-sm text-destructive">تعذّر البحث.</li>}
      {results.data?.map(m => <li key={m.id}>
        <button type="button" disabled={!!starting} onClick={() => void begin(m.id)} className="flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-accent disabled:opacity-60">
          <MemberAvatar name={m.username} seed={m.id} className="size-8 text-sm" />
          <span className="flex-1 truncate text-sm font-medium" dir="ltr">{m.username}</span>
          {starting === m.id && <LoaderCircle className="size-4 animate-spin" />}
        </button>
      </li>)}
    </ul>}
  </div>;
}

function Thread({ id, userId, fallbackName }: { id: string; userId: string; fallbackName?: string }) {
  const queryClient = useQueryClient();
  const fetchThread = useServerFn(listThread);
  const send = useServerFn(sendDirectMessage);
  const thread = useQuery({ queryKey: ['dm-thread', userId, id], queryFn: () => fetchThread({ data: { conversationId: id } }), refetchInterval: 30000, retry: false });
  const [older, setOlder] = useState<DmMessage[]>([]);
  const [hasOlder, setHasOlder] = useState<boolean | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const retryId = useRef<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const keepPosition = useRef<number | null>(null);
  const messages = mergeDmMessages(older, thread.data?.messages ?? []);
  const lastId = messages.at(-1)?.id;

  // Opening a thread marks it read on the server; refresh the unread badges.
  useEffect(() => { if (thread.data) void queryClient.invalidateQueries({ queryKey: ['dm-inbox'] }); }, [thread.dataUpdatedAt, queryClient]);
  useLayoutEffect(() => {
    const el = scroller.current; if (!el) return;
    if (keepPosition.current !== null) { el.scrollTop += el.scrollHeight - keepPosition.current; keepPosition.current = null; }
    else el.scrollTop = el.scrollHeight;
  }, [lastId, older.length]);

  const loadOlder = async () => {
    const first = messages[0]; if (!first || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const r = await fetchThread({ data: { conversationId: id, before: { time: first.created_at, id: first.id } } });
      keepPosition.current = scroller.current?.scrollHeight ?? 0;
      setOlder(o => mergeDmMessages(o, r.messages)); setHasOlder(r.hasMore);
    } catch { setError('تعذّر تحميل الرسائل الأقدم.'); } finally { setLoadingOlder(false); }
  };
  const submit = async () => {
    const text = body.trim();
    if (!text || sending) return;
    if (text.length > DM_MAX_LENGTH) { setError(`الحد الأقصى ${DM_MAX_LENGTH} حرف.`); return; }
    const clientId = retryId.current ?? crypto.randomUUID(); retryId.current = clientId;
    setSending(true); setError('');
    try {
      await send({ data: { conversationId: id, clientId, body: text } });
      setBody(''); retryId.current = null;
      await Promise.all([thread.refetch(), queryClient.invalidateQueries({ queryKey: ['dm-inbox'] })]);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذّر إرسال الرسالة.'); }
    finally { setSending(false); }
  };

  if (thread.isError) return <Centered>
    <p className="text-sm text-destructive">{thread.error instanceof Error ? thread.error.message : 'تعذّر فتح المحادثة.'}</p>
    <Button asChild variant="outline"><Link to="/messages">العودة إلى الرسائل</Link></Button>
  </Centered>;

  const name = thread.data?.otherUsername ?? fallbackName ?? '…';
  const otherRead = thread.data?.otherReadAt ?? '';
  const lastOwn = [...messages].reverse().find(m => m.sender_id === userId);
  const showMore = hasOlder ?? thread.data?.hasMore ?? false;

  return <>
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/90 px-3 py-3 sm:px-5">
      <Button asChild variant="ghost" size="icon" className="md:hidden" aria-label="العودة إلى المحادثات"><Link to="/messages"><ArrowRight /></Link></Button>
      <MemberAvatar name={name} seed={thread.data?.otherId ?? id} className="size-10" />
      <h2 className="min-w-0 truncate font-semibold" dir="auto">{name}</h2>
    </header>
    <div ref={scroller} className="starfield min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5" aria-busy={thread.isLoading} aria-live="polite">
      {thread.isLoading ? <Centered><LoaderCircle className="size-7 animate-spin text-primary" /></Centered> : <>
        {showMore && <div className="mb-3 flex justify-center"><Button size="sm" variant="outline" disabled={loadingOlder} onClick={() => void loadOlder()}>{loadingOlder ? 'جارٍ التحميل…' : 'رسائل أقدم'}</Button></div>}
        {messages.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">ابدأ المحادثة مع {name}.</p>}
        <ul className="space-y-2">
          {messages.map(m => {
            const own = m.sender_id === userId;
            return <li key={m.id} className={cn('flex', own ? 'justify-start' : 'justify-end')}>
              <div className="max-w-[80%] sm:max-w-[65%]">
                <div className={cn('whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed', own ? 'rounded-ss-md bg-primary text-primary-foreground' : 'rounded-se-md bg-muted text-foreground')} dir="auto">{m.body}</div>
                <p className={cn('mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground', own ? 'justify-start' : 'justify-end')}>
                  {timeFmt.format(new Date(m.created_at))}
                  {own && m.id === lastOwn?.id && (otherRead >= m.created_at
                    ? <span className="inline-flex items-center gap-0.5 text-primary"><CheckCheck className="size-3" />تمت القراءة</span>
                    : <span className="inline-flex items-center gap-0.5"><Check className="size-3" />أُرسلت</span>)}
                </p>
              </div>
            </li>;
          })}
        </ul>
      </>}
    </div>
    <footer className="shrink-0 border-t border-border bg-card px-3 py-3 sm:px-5">
      {error && <p role="alert" className="mb-2 text-xs text-destructive">{error}</p>}
      <form className="flex items-end gap-2" onSubmit={e => { e.preventDefault(); void submit(); }}>
        <Textarea value={body} onChange={e => { setBody(e.target.value); retryId.current = null; }} rows={1} maxLength={DM_MAX_LENGTH} placeholder="اكتب رسالة…" aria-label="نص الرسالة" dir="auto"
          className="max-h-32 min-h-11 resize-none" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void submit(); } }} />
        <Button type="submit" variant="hero" size="icon" className="size-11 shrink-0" disabled={sending || !body.trim() || thread.isLoading} aria-label="إرسال">
          {sending ? <LoaderCircle className="animate-spin" /> : <Send className="-scale-x-100" />}
        </Button>
      </form>
    </footer>
  </>;
}
