import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Compass } from "lucide-react";
import spaceHero from "@/assets/space-hero.jpg";
import { Logo } from "@/components/brand/Logo";
import { PhysyAvatar } from "@/components/brand/Physy";
import { ThemeToggle } from "@/components/common/ThemeControls";
import { Button } from "@/components/ui/button";
import { CATEGORIES, INTENTS } from "@/data/catalog";
import { useProfile } from "@/lib/app-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STORM WORLD — بيت كل محب للعلوم" },
      {
        name: "description",
        content: "انضم إلى STORM WORLD: مجتمع عربي آمن للطلاب ومحبي العلوم، تجد فيه من يشاركك شغفك بالفيزياء والفلك والبرمجة وغيرها.",
      },
      { property: "og:title", content: "STORM WORLD — بيت كل محب للعلوم" },
      { property: "og:description", content: "مجتمع عربي آمن للطلاب ومحبي العلوم، مع فيزي الروبوت المرحِّب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const [profile] = useProfile();
  return (
    <div className="min-h-dvh">
      {/* Hero is always "deep space", whatever the chosen theme */}
      <section className="dark relative isolate overflow-hidden bg-background text-foreground">
        <img
          src={spaceHero}
          alt=""
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover opacity-90"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/40 to-background" />

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link to="/feed">تصفّح المجتمع</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-20 pt-6 md:grid-cols-[1.1fr_0.9fr] md:pb-28 md:pt-12">
          <div className="animate-rise text-center md:text-start">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-accent-foreground">
              <span className="size-2 animate-twinkle rounded-full bg-storm" />
              مجتمع عربي للعلوم
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.2] sm:text-5xl lg:text-6xl">
              شغفك بالعلوم
              <br />
              <span className="text-gradient-storm">له مكان هنا</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground md:mx-0">
              مهما كان مجالك المفضل أو مستواك، ستجد في STORM WORLD من يسمعك ويحترم أسئلتك ويشاركك أحلامك العلمية.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
              {profile ? (
                <Button asChild variant="hero" size="lg">
                  <Link to="/feed">
                    متابعة إلى المجتمع
                    <ArrowLeft />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="hero" size="lg">
                  <Link to="/onboarding">
                    ابدأ رحلتك مع فيزي
                    <ArrowLeft />
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="lg">
                <Link to="/explore">
                  <Compass />
                  استكشف المجالات
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-64 sm:w-80 md:w-full md:max-w-sm">
            <div className="absolute inset-8 -z-10 rounded-full bg-primary/30 blur-3xl" />
            <PhysyAvatar float priority className="w-full" />
            <div className="surface absolute -bottom-2 start-0 max-w-[14rem] rounded-2xl rounded-bl-sm px-4 py-3 text-sm md:-start-6">
              <p className="text-xs font-semibold text-primary">فيزي</p>
              أهلاً! أنا فيزي، سأساعدك على إيجاد أصدقاء يحبون ما تحب ✨
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">كل منشور يبدأ بنيّة واضحة</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          اختر ما تحتاجه، ليعرف الآخرون كيف يساعدونك.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTENTS.map((i) => (
            <div key={i.key} className="surface p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <i.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{i.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/feed"
              search={{ topic: c.slug }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              <c.icon className="size-4" />
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
