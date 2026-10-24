import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Lock, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoNote } from "@/components/common/DemoNote";
import { categoryBySlug } from "@/data/catalog";
import { ROOMS, type Room } from "@/data/sample";

export const Route = createFileRoute("/_site/rooms/")({
  head: () => ({
    meta: [
      { title: "غرف النقاش العلمية — STORM WORLD" },
      { name: "description", content: "غرف نقاش عامة في الفلك والفيزياء والبرمجة والذكاء الاصطناعي، وغرف خاصة للفرق بإذن المشرف." },
      { property: "og:title", content: "غرف النقاش العلمية — STORM WORLD" },
      { property: "og:description", content: "انضم لنقاشات علمية مع طلاب يشاركونك الشغف." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoomsPage,
});

function RoomCard({ room }: { room: Room }) {
  const cat = categoryBySlug(room.category);
  const Icon = cat?.icon ?? Globe;
  const isPrivate = room.visibility === "private";
  return (
    <div className="surface flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 font-semibold">
            {room.name}
            {isPrivate && <Lock className="size-3.5 text-warning" />}
          </h3>
          <p className="text-sm text-muted-foreground">{room.topic}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          {room.members.length} أعضاء معروفون
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" />
          {room.online} متصل الآن
        </span>
      </div>
      <div className="mt-4">
        {isPrivate ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast("طلب الانضمام", { description: "في النسخة الكاملة يصل طلبك لمشرف الغرفة. لم يُرسل شيء الآن." })}
          >
            <Lock />
            اطلب الانضمام
          </Button>
        ) : (
          <Button asChild variant="soft" className="w-full">
            <Link to="/rooms/$roomId" params={{ roomId: room.id }}>
              ادخل الغرفة
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function RoomsPage() {
  const pub = ROOMS.filter((r) => r.visibility === "public");
  const priv = ROOMS.filter((r) => r.visibility === "private");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">غرف النقاش</h1>
        <p className="mt-1 text-muted-foreground">تحدّث مع من يحبون نفس المجال، في غرف يشرف عليها فريق المجتمع.</p>
      </div>
      <DemoNote>هذه معاينة لتصميم الغرف. المراسلة الفورية تحتاج خادماً مُعداً، وستُفعَّل في مرحلة لاحقة.</DemoNote>

      <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div><h2 className="font-semibold">الدردشة الجماعية</h2><p className="mt-1 text-sm text-muted-foreground">ملتقى محبّي العلوم والفضاء</p></div>
        <Button asChild variant="hero"><Link to="/chat">ادخل الدردشة</Link></Button>
      </div>

      <Tabs defaultValue="public" dir="rtl">
        <TabsList>
          <TabsTrigger value="public">
            <Globe className="me-1.5 size-4" />
            غرف عامة
          </TabsTrigger>
          <TabsTrigger value="private">
            <Lock className="me-1.5 size-4" />
            غرف خاصة
          </TabsTrigger>
        </TabsList>
        <TabsContent value="public" className="mt-5">
          {pub.length === 0 && <p className="surface p-6 text-center text-muted-foreground">لا توجد غرف عامة متاحة حالياً.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pub.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="private" className="mt-5">
          {priv.length === 0 && <p className="surface p-6 text-center text-muted-foreground">لا توجد غرف خاصة متاحة حالياً.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {priv.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <section className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border p-6 sm:flex-row sm:items-center">
        <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Video className="size-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-semibold">غرف الصوت والفيديو</h2>
          <p className="text-sm text-muted-foreground">مخطط لها في مرحلة لاحقة عبر مزود آمن. غير متاحة في هذه النسخة.</p>
        </div>
        <Button variant="outline" disabled>
          قريباً
        </Button>
      </section>
    </div>
  );
}
