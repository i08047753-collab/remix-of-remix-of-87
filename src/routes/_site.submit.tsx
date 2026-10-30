import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryChip, IntentBadge, StatusBadge } from "@/components/common/Chips";
import { DemoNote } from "@/components/common/DemoNote";
import { PhysySays } from "@/components/brand/Physy";
import { CATEGORIES, INTENTS, type CategorySlug, type IntentKey } from "@/data/catalog";
import { useMySubmissions, useProfile } from "@/lib/app-state";
import { listMyContent, submitContent } from "@/lib/publishing.functions";
import { useAuth } from "@/lib/auth-context";
import { FILE_ACCEPT, MAX_ATTACHMENTS, validateFileMetadata } from "@/lib/publishing-rules";
import { AttachmentList } from "@/components/common/AttachmentList";
import { Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/submit")({
  head: () => ({
    meta: [
      { title: "اقترح منشوراً — STORM WORLD" },
      { name: "description", content: "اكتب سؤالك أو تجربتك العلمية وأرسلها للمراجعة قبل النشر في مجتمع STORM WORLD." },
      { property: "og:title", content: "اقترح منشوراً — STORM WORLD" },
      { property: "og:description", content: "كل منشور يُراجع قبل نشره ليبقى المجتمع آمناً." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const [profile] = useProfile();
  const [mine] = useMySubmissions();
  const { user, ready } = useAuth();
  const queryClient = useQueryClient();
  const send = useServerFn(submitContent);
  const fetchMine = useServerFn(listMyContent);
  const remote = useQuery({ queryKey: ["my-content", user?.id], queryFn: () => fetchMine(), enabled: !!user });
  const [kind, setKind] = useState<"post" | "article">("post");
  const [code, setCode] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [intent, setIntent] = useState<IntentKey>("answer");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!user) return setError("سجّل دخولك قبل الإرسال.");
    if (title.trim().length < 5) return setError("اكتب عنواناً من 5 أحرف على الأقل");
    if (body.trim().length < 20) return setError("اشرح فكرتك في 20 حرفاً على الأقل");
    if (!category) return setError("اختر المجال العلمي");
    setError(null);
    setBusy(true);
    const form = new FormData();
    for (const [key, value] of Object.entries({ kind, title, body, category, intent, accessCode: code })) form.set(key, value);
    files.forEach(f => form.append("files", f));
    try {
      const result = await send({ data: form });
      if (!result.ok) { setError(result.error); return; }
      setTitle(""); setBody(""); setCategory(""); setFiles([]);
      toast.success("أُرسل للمراجعة", { description: "يبقى المحتوى خاصاً حتى موافقة المسؤول ونشره." });
      await queryClient.invalidateQueries({ queryKey: ["my-content"] });
    } catch { setError("تعذّر الإرسال. تحقق من تسجيل الدخول وحاول لاحقاً."); }
    finally { setBusy(false); setCode(""); }
  };

  const all = mine;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">اقترح منشوراً</h1>
          <p className="mt-1 text-muted-foreground">يراجع فريقنا كل منشور قبل نشره، ليبقى المكان آمناً ومفيداً للجميع.</p>
        </div>

        {!profile && !user && (
          <PhysySays>
            يمكنك تجربة النموذج الآن، لكن{" "}
            <Link to="/onboarding" className="font-medium text-primary hover:underline">
              أنشئ ملفك أولاً
            </Link>{" "}
            ليظهر اسمك على منشوراتك.
          </PhysySays>
        )}

        <form onSubmit={submit} className="surface space-y-5 p-5 sm:p-6" noValidate>
          <div className="flex gap-2" role="group" aria-label="نوع المحتوى">
            <Button type="button" variant={kind === "post" ? "soft" : "outline"} aria-pressed={kind === "post"} onClick={() => setKind("post")}>منشور</Button>
            <Button type="button" variant={kind === "article" ? "soft" : "outline"} aria-pressed={kind === "article"} onClick={() => setKind("article")}>مقال</Button>
          </div>
          <div className="space-y-2">
            <Label>ما الذي تريده من هذا المنشور؟</Label>
            <div className="grid grid-cols-2 gap-2">
              {INTENTS.map((i) => (
                <button
                  key={i.key}
                  type="button"
                  aria-pressed={intent === i.key}
                  onClick={() => setIntent(i.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all",
                    intent === i.key ? "border-primary bg-accent text-accent-foreground" : "border-border hover:border-primary/50",
                  )}
                >
                  <i.icon className="size-4 shrink-0" />
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">المجال</Label>
            <Select dir="rtl" value={category} onValueChange={(v) => setCategory(v as CategorySlug)}>
              <SelectTrigger id="category" className="h-11">
                <SelectValue placeholder="اختر مجالاً علمياً" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">العنوان</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="h-11" placeholder="مثلاً: لماذا السماء زرقاء؟" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">التفاصيل</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={6} maxLength={kind === "article" ? 20000 : 2000} placeholder="اشرح سؤالك أو تجربتك أو فكرتك…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publishing-code">رمز النشر</Label>
            <Input id="publishing-code" type="password" dir="ltr" autoComplete="off" maxLength={256} value={code} onChange={e => setCode(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <input ref={fileInput} type="file" multiple accept={FILE_ACCEPT} className="hidden" aria-label="المرفقات" onChange={e => {
              const added = Array.from(e.target.files ?? []); e.target.value = "";
              if (files.length + added.length > MAX_ATTACHMENTS) { setError("يمكن إرفاق ثلاثة ملفات كحد أقصى."); return; }
              for (const f of added) { const error = validateFileMetadata(f); if (error) { setError(error); return; } }
              setError(null); setFiles([...files, ...added]);
            }} />
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={busy || files.length >= MAX_ATTACHMENTS}><Paperclip />إرفاق ملفات</Button>
            <p className="text-xs text-muted-foreground">صور JPG، PNG، WebP · فيديو MP4، WebM · PDF · حتى 3 ملفات · 5 MB للصورة و20 MB للفيديو</p>
            <ul className="space-y-2">{files.map((f, i) => <li key={`${f.name}-${i}`} className="flex min-w-0 items-center gap-2 text-sm"><span className="min-w-0 flex-1 truncate">{f.name}</span><Button type="button" variant="ghost" size="icon" aria-label={`إزالة ${f.name}`} disabled={busy} onClick={() => setFiles(files.filter((_, n) => n !== i))}><X /></Button></li>)}</ul>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            لا تكتب عنوان بيتك أو رقم هاتفك أو اسم مدرستك أو أي وسيلة تواصل خاصة.
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!user && ready && <p className="text-sm text-muted-foreground"><Link to="/auth" className="text-primary hover:underline">سجّل دخولك</Link> لإرسال المحتوى بأمان.</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy || !user || !code}>
            <Send />
            {busy ? "جارٍ الإرسال…" : "أرسل للمراجعة"}
          </Button>
        </form>
      </div>

      <aside className="space-y-4">
        <h2 className="text-lg font-semibold">منشوراتي المقترحة</h2>
        {remote.isError && <p className="text-sm text-destructive">تعذّر تحميل اقتراحاتك. حاول إعادة تحميل الصفحة.</p>}
        {remote.isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>}
        <ul className="space-y-3">{remote.data?.map(s => <li key={s.id} className="surface p-4"><div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{s.status === "pending" ? "قيد المراجعة" : s.status === "approved" ? "مقبول — لم يُنشر بعد" : s.status === "published" ? "منشور" : "مرفوض"}</span><span>{s.kind === "article" ? "مقال" : "منشور"}</span></div><p className="mt-2 font-medium">{s.title}</p>{s.note && <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>}<AttachmentList attachments={s.attachments} /></li>)}</ul>
        {user && remote.data?.length === 0 && <p className="text-sm text-muted-foreground">لم ترسل محتوى للمراجعة بعد.</p>}
        <h3 className="text-sm font-semibold">اقتراحات سابقة على هذا الجهاز</h3>
        <DemoNote>هذه الاقتراحات القديمة محفوظة على جهازك فقط. لم تُرسل تلقائياً؛ يمكنك نسخها إلى النموذج وإرسالها بعد تسجيل الدخول.</DemoNote>
        <ul className="space-y-3">
          {all.length === 0 && <li className="surface p-6 text-center text-sm text-muted-foreground">لا توجد اقتراحات محفوظة بعد.</li>}
          {all.map((s) => (
            <li key={s.id} className="surface p-4">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={s.status} />
                <span className="text-xs text-muted-foreground">{s.submittedAt}</span>
              </div>
              <p className="mt-2 font-medium leading-snug">{s.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <CategoryChip slug={s.category} />
                <IntentBadge intent={s.intent} />
              </div>
              {s.note && (
                <p className="mt-3 rounded-lg bg-destructive/5 p-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-destructive">ملاحظة المشرف: </span>
                  {s.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
