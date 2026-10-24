import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Lock, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { DemoNote } from "@/components/common/DemoNote";
import { SafetyMenu } from "@/components/safety/SafetyMenu";
import { memberByUsername, ROOM_MESSAGES, ROOMS } from "@/data/sample";
import { useBlocked } from "@/lib/app-state";

export const Route = createFileRoute("/_site/rooms/$roomId")({
  loader: ({ params }) => {
    const room = ROOMS.find((r) => r.id === params.roomId);
    if (!room) throw notFound();
    return { room };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.room.name} — غرف STORM WORLD` : "غرفة غير متاحة — STORM WORLD" },
      { name: "description", content: loaderData ? `${loaderData.room.topic} — غرفة نقاش في STORM WORLD.` : "هذه الغرفة غير متاحة." },
      { property: "og:title", content: loaderData ? `${loaderData.room.name} — STORM WORLD` : "غرفة غير متاحة" },
      { property: "og:description", content: loaderData?.room.topic ?? "غرفة نقاش علمية" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">الغرفة غير موجودة</h1>
      <Link to="/rooms" className="mt-3 inline-block text-primary hover:underline">
        العودة للغرف
      </Link>
    </div>
  ),
  component: RoomPage,
});

function RoomPage() {
  const { room } = Route.useLoaderData();
  const [blocked] = useBlocked();
  const isPrivate = room.visibility === "private";
  const messages = (ROOM_MESSAGES[room.id] ?? []).filter((m) => !blocked.includes(m.author));

  return (
    <div className="space-y-4">
      <Link to="/rooms" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="size-4" />
        كل الغرف
      </Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="surface flex min-h-[32rem] flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h1 className="flex items-center gap-2 text-lg font-bold">
                {room.name}
                {isPrivate && <Lock className="size-4 text-warning" />}
              </h1>
              <p className="text-sm text-muted-foreground">{room.topic}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-success" />
              {room.online} متصل
            </span>
          </header>

          {isPrivate ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <Lock className="size-10 text-warning" />
              <p className="mt-3 font-semibold">غرفة خاصة</p>
              <p className="text-sm text-muted-foreground">لا تُعرض الرسائل إلا للأعضاء الذين وافق عليهم المشرف.</p>
            </div>
          ) : (
            <ol className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <li className="py-10 text-center text-sm text-muted-foreground">لا رسائل بعد في هذه المعاينة.</li>
              )}
              {messages.map((m) => {
                const author = memberByUsername(m.author);
                const name = author?.name ?? m.author;
                return (
                  <li key={m.id} className="group flex items-start gap-3">
                    <MemberAvatar name={name} seed={m.author} className="size-9 text-sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{name}</span>
                        <span className="text-xs text-muted-foreground">{m.time}</span>
                      </div>
                      <p className="mt-0.5 leading-relaxed">{m.text}</p>
                    </div>
                    <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <SafetyMenu username={m.author} targetLabel="هذه الرسالة" />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <footer className="space-y-3 border-t border-border p-4">
            <DemoNote className="py-2 text-xs">الإرسال غير مفعّل: الرسائل الفورية تحتاج خادماً وحسابات حقيقية.</DemoNote>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input disabled placeholder="اكتب رسالة محترمة…" className="h-11" aria-label="نص الرسالة" />
              <Button type="submit" variant="hero" size="icon" className="size-11" disabled aria-label="إرسال">
                <Send />
              </Button>
            </form>
          </footer>
        </section>

        <aside className="surface h-fit p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Users className="size-4 text-storm" />
            الأعضاء
          </h2>
          <ul className="mt-4 space-y-3">
            {room.members.map((u) => {
              const m = memberByUsername(u);
              return (
                <li key={u}>
                  <Link to="/u/$username" params={{ username: u }} className="flex items-center gap-3 rounded-lg p-1 hover:bg-accent">
                    <MemberAvatar name={m?.name ?? u} seed={u} className="size-8 text-sm" />
                    <span className="text-sm">{m?.name ?? u}</span>
                    {m?.role === "founder" && <span className="ms-auto rounded-full bg-accent px-2 py-0.5 text-[0.65rem] text-accent-foreground">مشرف</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
