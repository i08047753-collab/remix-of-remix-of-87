import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/feed/PostCard";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { PhysyAvatar } from "@/components/brand/Physy";
import { CATEGORIES } from "@/data/catalog";
import { MEMBERS, POSTS } from "@/data/sample";
import { useBlocked } from "@/lib/app-state";

export const Route = createFileRoute("/_site/explore")({
  head: () => ({
    meta: [
      { title: "استكشف المجالات والأعضاء — STORM WORLD" },
      { name: "description", content: "ابحث في منشورات STORM WORLD وتصفح 11 مجالاً علمياً وتعرّف على أعضاء يشاركونك الشغف." },
      { property: "og:title", content: "استكشف STORM WORLD" },
      { property: "og:description", content: "ابحث في المجالات العلمية والمنشورات والأعضاء." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explore,
});

const norm = (s: string) => s.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

function Explore() {
  const [q, setQ] = useState("");
  const [blocked] = useBlocked();
  const query = norm(q.trim());

  const results = useMemo(() => {
    if (!query) return null;
    return {
      categories: CATEGORIES.filter((c) => norm(c.name + c.blurb + c.slug).includes(query)),
      members: MEMBERS.filter((m) => !blocked.includes(m.username) && norm(m.name + m.username + m.bio).includes(query)),
      posts: POSTS.filter((p) => !blocked.includes(p.author) && norm(p.title + p.body).includes(query)),
    };
  }, [query, blocked]);

  const empty = results && !results.categories.length && !results.members.length && !results.posts.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">استكشف</h1>
        <p className="mt-1 text-muted-foreground">ابحث عن سؤال، مجال، أو صديق جديد</p>
        <div className="relative mx-auto mt-5 max-w-xl">
          <Search className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جرّب: المشتري، روبوت، بايثون…"
            className="h-12 rounded-2xl ps-12 text-base"
            aria-label="البحث"
          />
        </div>
      </div>

      {!results && (
        <>
          <section>
            <h2 className="mb-4 text-xl font-semibold">المجالات العلمية</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {CATEGORIES.map((c) => {
                const count = POSTS.filter((p) => p.category === c.slug).length;
                return (
                  <Link
                    key={c.slug}
                    to="/feed"
                    search={{ topic: c.slug }}
                    className="surface group p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <c.icon className="size-5" />
                    </span>
                    <p className="mt-3 font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.blurb}</p>
                    <p className="mt-2 text-xs text-primary">{count} منشور</p>
                  </Link>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-semibold">أعضاء المجتمع</h2>
            {MEMBERS.length === 0 && <p className="text-sm text-muted-foreground">لا توجد ملفات أعضاء متاحة حالياً.</p>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MEMBERS.filter((m) => !blocked.includes(m.username)).map((m) => (
                <MemberRow key={m.username} m={m} />
              ))}
            </div>
          </section>
        </>
      )}

      {results && (
        <div className="space-y-8">
          {empty && (
            <div className="flex flex-col items-center py-10 text-center">
              <PhysyAvatar className="size-24" />
              <p className="mt-3 font-semibold">لم أجد شيئاً بهذا الاسم</p>
              <p className="text-sm text-muted-foreground">جرّب كلمة أخرى أو اقترح منشوراً عن الموضوع.</p>
            </div>
          )}
          {!!results.categories.length && (
            <section>
              <h2 className="mb-3 font-semibold">المجالات</h2>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link key={c.slug} to="/feed" search={{ topic: c.slug }} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">
                    <c.icon className="size-4" />
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
          {!!results.members.length && (
            <section>
              <h2 className="mb-3 font-semibold">الأعضاء</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.members.map((m) => (
                  <MemberRow key={m.username} m={m} />
                ))}
              </div>
            </section>
          )}
          {!!results.posts.length && (
            <section className="space-y-4">
              <h2 className="font-semibold">المنشورات</h2>
              {results.posts.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function MemberRow({ m }: { m: (typeof MEMBERS)[number] }) {
  return (
    <Link to="/u/$username" params={{ username: m.username }} className="surface flex items-center gap-3 p-4 transition-colors hover:border-primary/40">
      <MemberAvatar name={m.name} seed={m.username} />
      <div className="min-w-0">
        <p className="font-medium">{m.name}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{m.bio}</p>
      </div>
    </Link>
  );
}
