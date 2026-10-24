import { createFileRoute, Link } from "@tanstack/react-router";
import { MessagesSquare, PenSquare, ShieldCheck, Sparkles } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PhysyAvatar } from "@/components/brand/Physy";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryBySlug } from "@/data/catalog";
import { MEMBERS, POSTS, ROOMS } from "@/data/sample";
import { useBlocked, useProfile } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublishedContent } from "@/lib/publishing.functions";
import { PublishedCard } from "@/components/feed/PublishedCard";
const publishedOptions = queryOptions({ queryKey: ["published-content"], queryFn: () => listPublishedContent() });

type FeedSearch = { topic?: string | undefined };

export const Route = createFileRoute("/_site/feed")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedOptions),
  validateSearch: (s: Record<string, unknown>): FeedSearch => {
    const t = s["topic"];
    return typeof t === "string" && categoryBySlug(t) ? { topic: t } : {};
  },
  head: () => ({
    meta: [
      { title: "آخر المنشورات العلمية — STORM WORLD" },
      { name: "description", content: "أسئلة وتجارب ومشاريع يشاركها طلاب ومحبو العلوم في الفيزياء والفلك والبرمجة والمزيد." },
      { property: "og:title", content: "آخر المنشورات العلمية — STORM WORLD" },
      { property: "og:description", content: "أسئلة وتجارب ومشاريع من مجتمع STORM WORLD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { topic } = Route.useSearch();
  const [profile] = useProfile();
  const [blocked] = useBlocked();
  const { data: published } = useSuspenseQuery(publishedOptions);
  const live = published.filter(p => !topic || p.category === topic);
  const posts = POSTS.filter((p) => (!topic || p.category === topic) && !blocked.includes(p.author));
  const current = topic ? categoryBySlug(topic) : undefined;

  const myFields = profile?.answers.fields ?? [];
  const similar = MEMBERS.filter((m) => m.role !== "founder")
    .map((m) => ({ m, score: m.fields.filter((f) => myFields.includes(f)).length }))
    .sort((x, y) => y.score - x.score)
    .slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-5">
        {profile ? (
          <div className="surface flex items-center gap-4 p-4">
            <MemberAvatar name={profile.username} seed={profile.username} className="size-11" />
            <Link to="/submit" className="flex-1 rounded-xl bg-muted px-4 py-3 text-muted-foreground transition-colors hover:bg-accent">
              ما الذي يدور في عقلك العلمي يا <bdi dir="ltr">@{profile.username}</bdi>؟
            </Link>
            <Button asChild variant="hero" size="icon" className="shrink-0" aria-label="اقترح منشوراً">
              <Link to="/submit">
                <PenSquare />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="surface relative flex items-center gap-4 overflow-hidden p-5">
            <PhysyAvatar className="size-20 shrink-0" priority />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">انضم ليصلك ما يناسب شغفك</h2>
              <p className="text-sm text-muted-foreground">فيزي سيسألك أسئلة قصيرة واختيارية.</p>
            </div>
            <Button asChild variant="hero">
              <Link to="/onboarding">انضم الآن</Link>
            </Button>
          </div>
        )}

        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <div className="flex w-max gap-2">
            <Link
              to="/feed"
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                !topic ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50",
              )}
            >
              الكل
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/feed"
                search={{ topic: c.slug }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  topic === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50",
                )}
              >
                <c.icon className="size-3.5" />
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {current && (
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <current.icon className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold">{current.name}</h1>
              <p className="text-sm text-muted-foreground">{current.blurb}</p>
            </div>
          </div>
        )}
        {!current && <h1 className="sr-only">آخر المنشورات</h1>}

        <div className="space-y-4">
          {posts.length === 0 && live.length === 0 ? (
            <div className="surface flex flex-col items-center p-10 text-center">
              <PhysyAvatar className="size-24" />
              <p className="mt-3 font-semibold">لا توجد منشورات هنا بعد</p>
              <p className="text-sm text-muted-foreground">كن أول من يشارك في هذا المجال!</p>
              <Button asChild variant="hero" className="mt-4">
                <Link to="/submit">اقترح منشوراً</Link>
              </Button>
            </div>
          ) : (
            <>{live.map(p => <PublishedCard key={p.id} content={p} />)}{posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}</>
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <section className="surface p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-primary" />
            {myFields.length ? "أعضاء يشاركونك الاهتمام" : "تعرّف على أعضاء المجتمع"}
          </h2>
          <ul className="mt-4 space-y-3">
            {similar.length === 0 && <li className="text-sm text-muted-foreground">لا توجد اقتراحات أعضاء حالياً.</li>}
            {similar.map(({ m }) => (
              <li key={m.username}>
                <Link to="/u/$username" params={{ username: m.username }} className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-accent">
                  <MemberAvatar name={m.name} seed={m.username} className="size-9" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.fields.map((f) => categoryBySlug(f)?.name).join(" · ")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <MessagesSquare className="size-4 text-storm" />
            غرف النقاش
          </h2>
          <ul className="mt-3 space-y-1">
            {ROOMS.length === 0 && <li className="text-sm text-muted-foreground">لا توجد غرف متاحة حالياً.</li>}
            {ROOMS.filter((r) => r.visibility === "public").slice(0, 3).map((r) => (
              <li key={r.id}>
                <Link to="/rooms/$roomId" params={{ roomId: r.id }} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent">
                  <span>{r.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-success" />
                    {r.online}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-primary/25 bg-accent/50 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            هنا نحترم بعضنا
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            كل سؤال مهم، وكل مستوى مرحب به. تراجع المنشورات قبل نشرها لنحافظ على مكان آمن للجميع.
          </p>
          <Link to="/rules" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            اقرأ قواعد المجتمع
          </Link>
        </section>
      </aside>
    </div>
  );
}
