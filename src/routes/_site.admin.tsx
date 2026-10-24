import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Eye, Flag, LayoutList, Megaphone, Settings2, Tags, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DemoNote } from "@/components/common/DemoNote";
import { CategoryChip, IntentBadge, StatusBadge } from "@/components/common/Chips";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { CATEGORIES } from "@/data/catalog";
import { MEMBERS, REPORTS, REVIEW_QUEUE, memberByUsername, type ModerationItem } from "@/data/sample";
import { cn } from "@/lib/utils";
import { PublishingReview } from "@/components/common/PublishingReview";

export const Route = createFileRoute("/_site/admin")({
  head: () => ({
    meta: [
      { title: "لوحة المؤسس (معاينة) — STORM WORLD" },
      { name: "description", content: "معاينة تصميم لوحة إشراف STORM WORLD: مراجعة المنشورات والبلاغات والأعضاء والتصنيفات." },
      { property: "og:title", content: "لوحة المؤسس — STORM WORLD" },
      { property: "og:description", content: "معاينة تصميم أدوات الإشراف." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type QueueState = ModerationItem & { published?: boolean };

function AdminPage() {
  const [queue, setQueue] = useState<QueueState[]>(REVIEW_QUEUE);
  const [selectedId, setSelectedId] = useState(REVIEW_QUEUE[0]?.id);
  const [note, setNote] = useState("");
  const [enabled, setEnabled] = useState<string[]>(CATEGORIES.map((c) => c.slug));
  const selected = queue.find((q) => q.id === selectedId);
  const pendingCount = queue.filter((q) => q.status === "pending").length;

  const update = (id: string, patch: Partial<QueueState>) => setQueue((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">لوحة المؤسس</h1>
          <p className="mt-1 text-muted-foreground">مراجعة وإدارة المجتمع</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-warning/15 px-3 py-1 text-warning-foreground dark:text-warning">المراجعة للمسؤولين</span>
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">{REPORTS.length} بلاغات</span>
        </div>
      </div>

      <DemoNote>
        <strong className="text-foreground">المراجعة متصلة بحسابات المسؤولين.</strong> باقي تبويبات هذه اللوحة للمعاينة فقط ولا تغيّر بيانات المجتمع.
      </DemoNote>

      <Tabs defaultValue="queue" dir="rtl">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="queue"><LayoutList className="me-1.5 size-4" />المراجعة</TabsTrigger>
          <TabsTrigger value="reports"><Flag className="me-1.5 size-4" />البلاغات</TabsTrigger>
          <TabsTrigger value="users"><Users className="me-1.5 size-4" />الأعضاء</TabsTrigger>
          <TabsTrigger value="categories"><Tags className="me-1.5 size-4" />التصنيفات</TabsTrigger>
          <TabsTrigger value="settings"><Settings2 className="me-1.5 size-4" />الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-5">
          <PublishingReview />
        </TabsContent>

        <TabsContent value="reports" className="mt-5">
          <ul className="space-y-3">
            {REPORTS.length === 0 && <li className="surface p-6 text-center text-muted-foreground">لا توجد بلاغات متاحة.</li>}
            {REPORTS.map((r) => (
              <li key={r.id} className="surface flex flex-wrap items-center gap-4 p-4">
                <Flag className="size-5 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.target}</p>
                  <p className="text-sm text-muted-foreground">{r.reason} · {r.reportedAt}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast("أُغلق البلاغ (معاينة)")}>لا مخالفة</Button>
                  <Button size="sm" variant="destructive" onClick={() => toast("أُخفي المحتوى (معاينة)")}>إخفاء المحتوى</Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="users" className="mt-5">
          <p className="mb-3 text-sm text-muted-foreground">تعرض اللوحة فقط ما يلزم للإشراف: اسم المستخدم وتاريخ الانضمام والحالة. لا تُعرض إجابات التعارف الخاصة.</p>
          <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="p-3 text-start font-medium">العضو</th>
                  <th className="p-3 text-start font-medium">انضم</th>
                  <th className="p-3 text-start font-medium">الحالة</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {MEMBERS.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">لا توجد بيانات أعضاء متصلة باللوحة.</td></tr>}
                {MEMBERS.map((m) => (
                  <tr key={m.username} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <MemberAvatar name={m.name} seed={m.username} className="size-8 text-sm" />
                        <span dir="ltr">@{m.username}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{m.joined}</td>
                    <td className="p-3">{m.role === "founder" ? "مؤسس" : "عضو نشط"}</td>
                    <td className="p-3 text-end">
                      {m.role !== "founder" && (
                        <Button size="sm" variant="ghost" onClick={() => toast("إيقاف مؤقت (معاينة)")}>إيقاف مؤقت</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c.slug} className="surface flex items-center gap-3 p-4">
                <c.icon className="size-5 text-primary" />
                <span className="flex-1 font-medium">{c.name}</span>
                <Switch
                  checked={enabled.includes(c.slug)}
                  onCheckedChange={(v) => setEnabled(v ? [...enabled, c.slug] : enabled.filter((e) => e !== c.slug))}
                  aria-label={`تفعيل ${c.name}`}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-5">
          <div className="surface divide-y divide-border">
            {[
              { id: "review", label: "مراجعة كل منشور قبل نشره", hint: "إلزامي للأعضاء ولا يمكن إيقافه", locked: true },
              { id: "physy", label: "ترحيب فيزي بالأعضاء الجدد", hint: "أسئلة التعارف الاختيارية" },
              { id: "private-rooms", label: "السماح بطلب غرف خاصة", hint: "تُنشأ بموافقة المؤسس" },
            ].map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 p-4">
                <Label htmlFor={s.id} className="leading-relaxed">
                  {s.label}
                  <span className="block text-xs font-normal text-muted-foreground">{s.hint}</span>
                </Label>
                <Switch id={s.id} defaultChecked disabled={s.locked} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
