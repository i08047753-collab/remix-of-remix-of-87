import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeOptionCards } from "@/components/common/ThemeControls";
import { useBlocked, useLiked, useMySubmissions, useProfile, useTheme } from "@/lib/app-state";

export const Route = createFileRoute("/_site/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — STORM WORLD" },
      { name: "description", content: "غيّر مظهر STORM WORLD وإعدادات الخصوصية وقائمة المحظورين." },
      { property: "og:title", content: "الإعدادات — STORM WORLD" },
      { property: "og:description", content: "المظهر والخصوصية والأمان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [theme, setTheme] = useTheme();
  const [profile, setProfile] = useProfile();
  const [blocked, setBlocked] = useBlocked();
  const [, setMine] = useMySubmissions();
  const [, setLiked] = useLiked();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">الإعدادات</h1>

      <section className="surface space-y-4 p-6">
        <h2 className="text-lg font-semibold">المظهر</h2>
        <ThemeOptionCards value={theme ?? "dark"} onPick={setTheme} />
      </section>

      <section className="surface space-y-4 p-6">
        <h2 className="text-lg font-semibold">الخصوصية</h2>
        {profile ? (
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="pub-fields" className="leading-relaxed">
              إظهار مجالاتي المفضلة في ملفي العام
              <span className="block text-xs font-normal text-muted-foreground">بقية إجاباتك مع فيزي خاصة دائماً</span>
            </Label>
            <Switch
              id="pub-fields"
              checked={profile.showFieldsPublicly}
              onCheckedChange={(v) => setProfile({ ...profile, showFieldsPublicly: v })}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link to="/onboarding" className="text-primary hover:underline">أنشئ ملفك</Link> لتظهر إعدادات الخصوصية.
          </p>
        )}
      </section>

      <section className="surface space-y-4 p-6">
        <h2 className="text-lg font-semibold">المحظورون</h2>
        {blocked.length === 0 ? (
          <p className="text-sm text-muted-foreground">لم تحظر أحداً.</p>
        ) : (
          <ul className="divide-y divide-border">
            {blocked.map((u) => (
              <li key={u} className="flex items-center justify-between py-2.5">
                <span dir="ltr">@{u}</span>
                <Button variant="ghost" size="sm" onClick={() => setBlocked(blocked.filter((b) => b !== u))}>
                  إلغاء الحظر
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface space-y-3 p-6">
        <h2 className="text-lg font-semibold">بيانات النسخة التجريبية</h2>
        <p className="text-sm text-muted-foreground">ملفك واقتراحاتك وإعجاباتك محفوظة على هذا الجهاز فقط. يمكنك مسحها والبدء من جديد.</p>
        <Button
          variant="destructive"
          onClick={() => {
            setProfile(null);
            setMine([]);
            setBlocked([]);
            setLiked([]);
            toast("مُسحت بيانات التجربة من هذا الجهاز");
          }}
        >
          مسح بياناتي من هذا الجهاز
        </Button>
      </section>
    </div>
  );
}
