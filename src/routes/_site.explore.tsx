import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Hash, Search } from "lucide-react";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { PhysyAvatar } from "@/components/brand/Physy";
import { PublishedCard } from "@/components/feed/PublishedCard";
import { CATEGORIES } from "@/data/catalog";
import { listPublishedContent } from "@/lib/publishing.functions";
import { searchMembers } from "@/lib/social.functions";
import { extractHashtags, normalizeTag, popularTags } from "@/lib/hashtags";

const publishedOptions = queryOptions({ queryKey: ["published-content"], queryFn: () => listPublishedContent() });

export const Route = createFileRoute("/_site/explore")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s["q"] === "string" && s["q"] ? { q: s["q"].slice(0, 80) } : {}),
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedOptions),
  head: () => ({
    meta: [
      { title: "استكشف المنشورات والوسوم والأعضاء — STORM WORLD" },
      { name: "description", content: "ابحث في منشورات STORM WORLD وتصفح الوسوم الرائجة والمجالات العلمية وتعرّف على الأعضاء." },
      { property: "og:title", content: "استكشف STORM WORLD" },
      { property: "og:description", content: "ابحث في المنشورات والوسوم والأعضاء." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <p className="text-center text-muted-foreground">تعذّر تحميل نتائج البحث.</p>,
  notFoundComponent: () => <p className="text-center text-muted-foreground">لا شيء هنا.</p>,
  component: Explore,
});

const norm = (s: string) => normalizeTag(s);

function Explore() {
  const { q: urlQ = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const [q, setQ] = useState(urlQ);
  useEffect(() => setQ(urlQ), [urlQ]);
  useEffect(() => {
    const t = setTimeout(() => { if (q !== urlQ) navigate({ search: q.trim() ? { q } : {}, replace: true }); }, 300);
    return () => clearTimeout(t);
  }, [q, urlQ, navigate]);

  const { data: posts } = useSuspenseQuery(publishedOptions);
  const trimmed = urlQ.trim();
  const isTag = trimmed.startsWith("#");
  const query = norm(trimmed);

  const tags = useMemo(() => popularTags(posts.map((p) => p.title + " " + p.body)), [posts]);
  const results = useMemo(() => {
    if (!query) return null;
    return {
      categories: isTag ? [] : CATEGORIES.filter((c) => norm(c.name + c.blurb + c.slug).includes(query)),
      posts: posts.filter((p) => isTag ? extractHashtags(p.title + " " + p.body).includes(query) : norm(p.title + " " + p.body).includes(query)),
    };
  }, [query, isTag, posts]);

  const members = useQuery({
    queryKey: ["member-search", query],
    queryFn: () => searchMembers({ data: { q: query } }),
    enabled: !!query && !isTag,
  });
  const memberList = members.data ?? [];
  const empty = results && !results.categories.length && !results.posts.length && !memberList.length && !members.isFetching;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">استكشف</h1>
        <p className="mt-1 text-muted-foreground">ابحث عن منشور، وسم، مجال، أو عضو</p>
        <div className="relative mx-auto mt-5 max-w-xl">
          <Search className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جرّب: #فيزياء، روبوت، @اسم…" className="h-12 rounded-2xl ps-12 text-base" aria-label="البحث" />
        </div>
      </div>

      {!!tags.length && (
        <section>
          <h2 className="mb-3 font-semibold">الوسوم الرائجة</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link key={t.tag} to="/explore" search={{ q: "#" + t.tag }} className={"inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm " + (isTag && query === t.tag ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground")}>
                <Hash className="size-3.5" />{t.tag}<span className="opacity-70">· {t.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!results && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">المجالات العلمية</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to="/feed" search={{ topic: c.slug }} className="surface group p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><c.icon className="size-5" /></span>
                <p className="mt-3 font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.blurb}</p>
                <p className="mt-2 text-xs text-primary">{posts.filter((p) => p.category === c.slug).length} منشور</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results && (
        <div className="space-y-8">
          {empty && (
            <div className="flex flex-col items-center py-10 text-center">
              <PhysyAvatar className="size-24" />
              <p className="mt-3 font-semibold">لم أجد شيئاً بهذا الاسم</p>
              <p className="text-sm text-muted-foreground">جرّب كلمة أو وسماً آخر.</p>
            </div>
          )}
          {!!results.categories.length && (
            <section>
              <h2 className="mb-3 font-semibold">المجالات</h2>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link key={c.slug} to="/feed" search={{ topic: c.slug }} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground"><c.icon className="size-4" />{c.name}</Link>
                ))}
              </div>
            </section>
          )}
          {!!memberList.length && (
            <section>
              <h2 className="mb-3 font-semibold">الأعضاء</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {memberList.map((m) => (
                  <Link key={m.username} to="/u/$username" params={{ username: m.username }} className="surface flex items-center gap-3 p-4 transition-colors hover:border-primary/40">
                    <MemberAvatar name={m.username} seed={m.username} />
                    <bdi dir="ltr" className="font-medium">@{m.username}</bdi>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {!!results.posts.length && (
            <section className="space-y-4">
              <h2 className="font-semibold">{isTag ? `منشورات #${query}` : "المنشورات"}</h2>
              {results.posts.map((p) => <PublishedCard key={p.id} content={p} />)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
