import { createFileRoute, Link } from "@tanstack/react-router";
import { FileClock, Lock, Settings, UserRound } from "lucide-react";
import { PhysyAvatar } from "@/components/brand/Physy";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { CategoryChip } from "@/components/common/Chips";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { intentByKey } from "@/data/catalog";
import { useProfile } from "@/lib/app-state";

export const Route = createFileRoute("/_site/me")({
  head: () => ({
    meta: [
      { title: "حسابي — STORM WORLD" },
      { name: "description", content: "ملفك في STORM WORLD: نبذتك، اهتماماتك الخاصة، وإعدادات الخصوصية." },
      { property: "og:title", content: "حسابي — STORM WORLD" },
      { property: "og:description", content: "إدارة ملفك واهتماماتك في STORM WORLD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MePage,
});

function MePage() {
  const [profile, setProfile] = useProfile();

  if (!profile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
        <PhysyAvatar float className="w-44" />
        <h1 className="mt-4 text-2xl font-bold">لم تنشئ ملفك بعد</h1>
        <p className="mt-1 text-muted-foreground">دقيقتان مع فيزي وتصبح جزءاً من المجتمع.</p>
        <Button asChild variant="hero" size="lg" className="mt-6">
          <Link to="/onboarding">ابدأ مع فيزي</Link>
        </Button>
      </div>
    );
  }

  const a = profile.answers;
  const nothing = !a.fields.length && !a.topics.length && !a.topicsNote && !a.projects.length && !a.dreams && !a.intents.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <MemberAvatar name={profile.username} seed={profile.username} className="size-16 text-2xl" />
        <div className="flex-1">
          <h1 dir="ltr" className="text-end text-2xl font-bold sm:text-start" style={{ direction: "ltr" }}>
            @{profile.username}
          </h1>
          <p className="mt-1 text-muted-foreground">{profile.bio || "بلا نبذة بعد"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/u/$username" params={{ username: profile.username }}>
              <UserRound />
              ملفي العام
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/settings">
              <Settings />
              الإعدادات
            </Link>
          </Button>
        </div>
      </section>

      <Link to="/submit" className="surface flex items-center gap-3 p-5 transition-colors hover:border-primary/40">
        <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
          <FileClock className="size-5" />
        </span>
        <div>
          <p className="font-semibold">منشوراتي المقترحة</p>
          <p className="text-sm text-muted-foreground">تابع حالة المراجعة: قيد المراجعة، مقبول، أو مرفوض</p>
        </div>
      </Link>

      <section className="surface p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Lock className="size-4 text-primary" />
            إجاباتي مع فيزي
          </h2>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">خاصة — لا يراها غيرك</span>
        </div>

        {nothing ? (
          <p className="mt-4 text-sm text-muted-foreground">
            تخطيت كل الأسئلة، وهذا تماماً حقك.{" "}
            <Link to="/onboarding" className="text-primary hover:underline">
              أجب الآن
            </Link>
          </p>
        ) : (
          <dl className="mt-5 space-y-4 text-sm">
            {a.fields.length > 0 && (
              <div>
                <dt className="mb-2 text-muted-foreground">المجالات التي أحبها</dt>
                <dd className="flex flex-wrap gap-2">
                  {a.fields.map((f) => (
                    <CategoryChip key={f} slug={f} />
                  ))}
                </dd>
              </div>
            )}
            {(a.topics.length > 0 || a.topicsNote) && (
              <div>
                <dt className="mb-1 text-muted-foreground">مواضيع أخرى</dt>
                <dd>{[...a.topics, a.topicsNote].filter(Boolean).join("، ")}</dd>
              </div>
            )}
            {a.projects.length > 0 && (
              <div>
                <dt className="mb-1 text-muted-foreground">مشاريع أستمتع بها</dt>
                <dd>{a.projects.join("، ")}</dd>
              </div>
            )}
            {a.dreams && (
              <div>
                <dt className="mb-1 text-muted-foreground">حلمي العلمي</dt>
                <dd className="leading-relaxed">{a.dreams}</dd>
              </div>
            )}
            {a.intents.length > 0 && (
              <div>
                <dt className="mb-1 text-muted-foreground">أبحث عن</dt>
                <dd>{a.intents.map((i) => intentByKey(i)?.label).join("، ")}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-muted p-4">
          <Label htmlFor="show-fields" className="leading-relaxed">
            إظهار مجالاتي المفضلة فقط في ملفي العام
            <span className="block text-xs font-normal text-muted-foreground">باقي الإجابات تبقى خاصة دائماً</span>
          </Label>
          <Switch
            id="show-fields"
            checked={profile.showFieldsPublicly}
            onCheckedChange={(v) => setProfile({ ...profile, showFieldsPublicly: v })}
          />
        </div>
      </section>
    </div>
  );
}
