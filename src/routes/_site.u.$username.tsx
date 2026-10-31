import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, EyeOff } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { CategoryChip } from "@/components/common/Chips";
import { SafetyMenu } from "@/components/safety/SafetyMenu";
import { PhysyAvatar } from "@/components/brand/Physy";
import { Button } from "@/components/ui/button";
import { memberByUsername, POSTS } from "@/data/sample";
import { useBlocked, useProfile } from "@/lib/app-state";
import { usePublicProfileMedia } from "@/components/profile/ProfileMediaEditor";

export const Route = createFileRoute("/_site/u/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — STORM WORLD` },
      { name: "description", content: `الملف العام للعضو @${params.username} في مجتمع STORM WORLD للعلوم.` },
      { property: "og:title", content: `@${params.username} — STORM WORLD` },
      { property: "og:description", content: `تعرّف على اهتمامات @${params.username} العلمية ومنشوراته.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const [me] = useProfile();
  const [blocked] = useBlocked();
  const member = memberByUsername(username);
  const isMe = me?.username === username;
  const { data: media } = usePublicProfileMedia(username);

  if (!member && !isMe) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <PhysyAvatar className="size-28" />
        <h1 className="mt-4 text-2xl font-bold">لم أجد هذا العضو</h1>
        <p className="text-muted-foreground">ربما تغيّر اسم المستخدم.</p>
        <Button asChild variant="hero" className="mt-5">
          <Link to="/explore">ابحث عن أعضاء</Link>
        </Button>
      </div>
    );
  }

  const name = member?.name ?? username;
  const bio = isMe ? (me?.bio ?? "") : (member?.bio ?? "");
  const fields = isMe ? (me?.showFieldsPublicly ? me.answers.fields : []) : (member?.fields ?? []);
  const posts = POSTS.filter((p) => p.author === username);
  const isBlocked = blocked.includes(username);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="surface relative overflow-hidden p-6">
        {media?.coverUrl ? <img src={media.coverUrl} alt="صورة الغلاف" className="absolute inset-x-0 top-0 h-32 w-full object-cover" /> : <div className="absolute inset-x-0 top-0 h-24 bg-gradient-storm opacity-25" />}
        <div className="relative flex flex-col items-start gap-4 pt-16 sm:flex-row sm:items-end">
          {media?.avatarUrl ? <img src={media.avatarUrl} alt={name} className="size-20 shrink-0 rounded-full object-cover ring-4 ring-background" /> : <MemberAvatar name={name} seed={username} className="size-20 text-3xl ring-4 ring-background" />}
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {name}
              {member?.role === "founder" && <BadgeCheck className="size-5 text-primary" aria-label="المؤسس" />}
            </h1>
            <p dir="ltr" className="text-end text-sm text-muted-foreground sm:text-start" style={{ direction: "ltr" }}>
              @{username}
            </p>
          </div>
          {isMe ? (
            <Button asChild variant="outline">
              <Link to="/me">إدارة ملفي</Link>
            </Button>
          ) : (
            <SafetyMenu username={username} targetLabel={`@${username}`} />
          )}
        </div>
        {bio && <p className="relative mt-4 leading-relaxed">{bio}</p>}
        {fields.length > 0 && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {fields.map((f) => (
              <CategoryChip key={f} slug={f} />
            ))}
          </div>
        )}
        <p className="relative mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <EyeOff className="size-3.5" />
          لا نعرض العمر أو المدينة أو المدرسة أو إجابات التعارف الخاصة.
        </p>
      </section>

      {isBlocked ? (
        <p className="surface p-6 text-center text-muted-foreground">لقد حظرت هذا العضو، لذلك لا تظهر منشوراته.</p>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">المنشورات</h2>
          {posts.length ? (
            posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
          ) : (
            <p className="surface p-6 text-center text-muted-foreground">لا توجد منشورات منشورة بعد.</p>
          )}
        </section>
      )}
    </div>
  );
}
