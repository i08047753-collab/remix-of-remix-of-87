import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Flag, LayoutList, Settings2, Tags, Users, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { CATEGORIES } from "@/data/catalog";
import { PublishingReview } from "@/components/common/PublishingReview";
import { AdminGate } from "@/components/common/AdminAccess";
import { listMembers, listReports, closeReport, deletePostByAdmin } from "@/lib/moderation.functions";

export const Route = createFileRoute("/_site/admin")({
  head: () => ({
    meta: [
      { title: "لوحة المؤسس — STORM WORLD" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdminGate><AdminPage /></AdminGate>,
});

function AdminPage() {
  const [enabled, setEnabled] = useState<string[]>(CATEGORIES.map((c) => c.slug));
  const [members, setMembers] = useState<{ username: string; joined: string; admin: boolean }[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  const loadData = async () => {
    try {
      const [m, r] = await Promise.all([listMembers(), listReports()]);
      setMembers(m);
      setReports(r);
    } catch (err: any) {
      toast.error(err?.message || "فشل تحميل البيانات");
    } finally {
      setLoadingMembers(false);
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCloseReport = async (id: string, status: "dismissed" | "actioned") => {
    try {
      await closeReport({ data: { id, status } });
      toast.success(status === "actioned" ? "تم اتخاذ الإجراء على البلاغ" : "تم حفظ البلاغ دون مخالفة");
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("تعذّر تحديث حالة البلاغ");
    }
  };

  const handleDeleteReportedPost = async (contentId: string, reportId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنشور المخالف نهائياً من الموقع؟")) return;
    try {
      await deletePostByAdmin({ data: { contentId, reportId } });
      toast.success("تم حذف المنشور وإغلاق البلاغ بنجاح 🗑️");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      toast.error("تعذّر حذف المنشور");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">لوحة المؤسس</h1>
          <p className="mt-1 text-muted-foreground">مراجعة وإدارة مجتمع STORM WORLD</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{members.length} عضو مسجل</span>
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">{reports.length} بلاغات</span>
        </div>
      </div>

      <Tabs defaultValue="queue" dir="rtl">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="queue"><LayoutList className="me-1.5 size-4" />المراجعة</TabsTrigger>
          <TabsTrigger value="reports"><Flag className="me-1.5 size-4" />البلاغات ({reports.length})</TabsTrigger>
          <TabsTrigger value="users"><Users className="me-1.5 size-4" />الأعضاء ({members.length})</TabsTrigger>
          <TabsTrigger value="categories"><Tags className="me-1.5 size-4" />التصنيفات</TabsTrigger>
          <TabsTrigger value="settings"><Settings2 className="me-1.5 size-4" />الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-5">
          <PublishingReview />
        </TabsContent>

        <TabsContent value="reports" className="mt-5">
          {loadingReports ? (
            <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : reports.length === 0 ? (
            <div className="surface p-6 text-center text-muted-foreground">لا توجد بلاغات حالياً 🎉</div>
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => {
                const matchPost = r.target_label?.match(/^\[post:([a-f0-9\-]+)\]\s*(.*)$/);
                const postId = matchPost ? matchPost[1] : null;
                const cleanLabel = matchPost ? matchPost[2] : r.target_label;

                return (
                  <li key={r.id} className="surface flex flex-wrap items-center gap-4 p-4">
                    <Flag className="size-5 text-destructive shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{cleanLabel}</p>
                      <p className="text-sm text-destructive">{r.reason}</p>
                      {r.note && <p className="text-xs text-muted-foreground mt-0.5">ملاحظة: {r.note}</p>}
                      <span className="text-[11px] text-muted-foreground mt-1 inline-block" dir="ltr">
                        {new Date(r.created_at).toLocaleString("ar")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCloseReport(r.id, "dismissed")}>لا مخالفة</Button>
                      {postId ? (
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReportedPost(postId, r.id)}>
                          <Trash2 className="me-1.5 size-3.5" />
                          حذف المنشور المخالف
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => handleCloseReport(r.id, "actioned")}>إجراء وإغلاق</Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-5">
          {loadingMembers ? (
            <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="surface overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3 text-start">العضو</th>
                    <th className="p-3 text-start">تاريخ الانضمام</th>
                    <th className="p-3 text-start">الرتبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m) => (
                    <tr key={m.username} className="hover:bg-accent/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MemberAvatar username={m.username} size="sm" />
                          <span className="font-semibold text-foreground">@{m.username}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground" dir="ltr">{new Date(m.joined).toLocaleDateString("ar")}</td>
                      <td className="p-3">
                        {m.admin ? (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">مشرف</span>
                        ) : (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">عضو</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-5 space-y-3">
          {CATEGORIES.map((c) => (
            <div key={c.slug} className="surface flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </div>
              <Switch
                checked={enabled.includes(c.slug)}
                onCheckedChange={(checked) =>
                  setEnabled((prev) => (checked ? [...prev, c.slug] : prev.filter((s) => s !== c.slug)))
                }
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="mt-5 space-y-3">
          <div className="surface space-y-4 p-5">
            <h2 className="font-semibold">إعدادات المنصة</h2>
            {[
              { id: "reg", label: "التسجيل متاح للجميع", hint: "السماح بإنشاء حسابات جديدة", locked: true },
              { id: "guest", label: "تصفح الزوار", hint: "السماح بالقراءة دون تسجيل", locked: false },
              { id: "mod", label: "مراجعة النشر التلقائية", hint: "طلب مراجعة المشرف قبل النشر", locked: true },
            ].map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-2">
                <Label htmlFor={s.id} className="flex flex-col gap-1 cursor-pointer">
                  <span>{s.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">{s.hint}</span>
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
