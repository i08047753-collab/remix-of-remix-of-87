import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { PhysyAvatar, PhysySays } from "@/components/brand/Physy";
import { ThemeToggle } from "@/components/common/ThemeControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, INTENTS } from "@/data/catalog";
import { MEMBERS, PROJECT_KINDS, SUGGESTED_TOPICS } from "@/data/sample";
import { EMPTY_ANSWERS, useProfile, type OnboardingAnswers } from "@/lib/app-state";
import { BIO_MAX, USERNAME_MAX, validateBio, validateUsername } from "@/lib/rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "انضم إلى STORM WORLD — تعرّف على فيزي" },
      { name: "description", content: "اختر اسم مستخدم ونبذة قصيرة، ثم أجب عن أسئلة فيزي الاختيارية لنقترح لك مواضيع وأصدقاء." },
      { property: "og:title", content: "انضم إلى STORM WORLD" },
      { property: "og:description", content: "خطوات بسيطة مع فيزي للانضمام إلى مجتمع العلوم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const RESERVED = ["admin", "founder", "storm", "stormworld", "physy", "moderator", "support"];
const TAKEN = [...MEMBERS.map((m) => m.username), ...RESERVED];

type Step = "welcome" | "account" | "fields" | "topics" | "projects" | "dreams" | "intents" | "done";
const QUESTION_STEPS: Step[] = ["fields", "topics", "projects", "dreams", "intents"];
const ORDER: Step[] = ["welcome", "account", ...QUESTION_STEPS, "done"];

function ChoiceChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card hover:border-primary/60",
      )}
    >
      {selected && <Check className="size-3.5" />}
      {children}
    </button>
  );
}

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Onboarding() {
  const navigate = useNavigate();
  const [, setProfile] = useProfile();
  const [step, setStep] = useState<Step>("welcome");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [touched, setTouched] = useState(false);
  const [a, setA] = useState<OnboardingAnswers>(EMPTY_ANSWERS);

  const check = useMemo(() => validateUsername(username, TAKEN), [username]);
  const bioError = validateBio(bio);
  const idx = ORDER.indexOf(step);
  const qIndex = QUESTION_STEPS.indexOf(step);
  const go = (s: Step) => setStep(s);
  const next = () => go(ORDER[Math.min(idx + 1, ORDER.length - 1)] ?? "done");
  const back = () => go(ORDER[Math.max(idx - 1, 0)] ?? "welcome");

  const finish = () => {
    if (!check.ok) return go("account");
    setProfile({ username: check.value, bio: bio.trim(), answers: a, showFieldsPublicly: false });
    toast.success(`أهلاً بك يا @${check.value}!`, { description: "حُفظ ملفك على هذا الجهاز فقط في النسخة التجريبية." });
    navigate({ to: "/feed" });
  };

  return (
    <div className="flex min-h-dvh flex-col starfield">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-10">
        {step !== "welcome" && step !== "done" && (
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>{step === "account" ? "حسابك" : `سؤال ${qIndex + 1} من ${QUESTION_STEPS.length} — اختياري`}</span>
              <span>{Math.round((idx / (ORDER.length - 1)) * 100)}٪</span>
            </div>
            <Progress value={(idx / (ORDER.length - 1)) * 100} className="h-1.5" />
          </div>
        )}

        {step === "welcome" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center animate-rise">
            <PhysyAvatar float priority className="w-52 sm:w-64" />
            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">مرحباً، أنا فيزي!</h1>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-muted-foreground">
              أنا روبوت STORM WORLD. سأرافقك في خطوات قصيرة لنصنع ملفك ونعرف ما تحبه من العلوم.
            </p>
            <Button variant="hero" size="lg" className="mt-8" onClick={next}>
              هيا نبدأ
              <ArrowLeft />
            </Button>
            <Link to="/feed" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
              أريد التصفح أولاً
            </Link>
          </div>
        )}

        {step === "account" && (
          <div className="space-y-5">
            <PhysySays>اختر اسماً يعرفك به الأصدقاء، واكتب سطراً قصيراً عنك. لا نحتاج بريدك الإلكتروني.</PhysySays>
            <div className="surface space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-muted-foreground" dir="ltr">@</span>
                  <Input
                    id="username"
                    dir="ltr"
                    autoComplete="off"
                    value={username}
                    maxLength={USERNAME_MAX + 5}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="nour_science"
                    className="h-11 pe-8 text-start"
                    aria-invalid={touched && !check.ok}
                  />
                </div>
                <p className={cn("text-xs", touched && !check.ok ? "text-destructive" : "text-muted-foreground")}>
                  {touched && !check.ok ? check.error : "حروف إنجليزية وأرقام و _ — من 3 إلى 20 حرفاً"}
                  {check.ok && <span className="text-success"> — الاسم متاح ✓</span>}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">نبذة قصيرة</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="مثلاً: أحب الفلك وأحلم برؤية زحل بمنظاري الخاص"
                  rows={3}
                />
                <p className={cn("text-xs", bioError ? "text-destructive" : "text-muted-foreground")}>
                  {bio.length}/{BIO_MAX} — لا تكتب عنوانك أو رقمك أو اسم مدرستك.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                فيزي لن يسألك عن كلمة مرورك أبداً. في النسخة الكاملة ستختار كلمة المرور في نموذج آمن منفصل.
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}>
                <ArrowRight />
                رجوع
              </Button>
              <Button
                variant="hero"
                onClick={() => {
                  setTouched(true);
                  if (check.ok && !bioError) next();
                }}
              >
                التالي
                <ArrowLeft />
              </Button>
            </div>
          </div>
        )}

        {step === "fields" && (
          <Question onBack={back} onSkip={next} onNext={next} question="ما المجالات العلمية التي تحبها؟ اختر ما تشاء.">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <ChoiceChip key={c.slug} selected={a.fields.includes(c.slug)} onClick={() => setA({ ...a, fields: toggle(a.fields, c.slug) })}>
                  <c.icon className="size-4" />
                  {c.name}
                </ChoiceChip>
              ))}
            </div>
          </Question>
        )}

        {step === "topics" && (
          <Question onBack={back} onSkip={next} onNext={next} question="وما المواضيع الأخرى التي تثير فضولك؟">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TOPICS.map((t) => (
                <ChoiceChip key={t} selected={a.topics.includes(t)} onClick={() => setA({ ...a, topics: toggle(a.topics, t) })}>
                  {t}
                </ChoiceChip>
              ))}
            </div>
            <Input
              value={a.topicsNote}
              onChange={(e) => setA({ ...a, topicsNote: e.target.value })}
              placeholder="موضوع آخر؟ اكتبه هنا"
              maxLength={80}
              className="mt-4 h-11"
            />
          </Question>
        )}

        {step === "projects" && (
          <Question onBack={back} onSkip={next} onNext={next} question="ما نوع المشاريع العلمية التي تستمتع بها؟">
            <div className="flex flex-wrap gap-2">
              {PROJECT_KINDS.map((t) => (
                <ChoiceChip key={t} selected={a.projects.includes(t)} onClick={() => setA({ ...a, projects: toggle(a.projects, t) })}>
                  {t}
                </ChoiceChip>
              ))}
            </div>
          </Question>
        )}

        {step === "dreams" && (
          <Question onBack={back} onSkip={next} onNext={next} question="أخبرني عن حلمك أو هدفك العلمي. لا يوجد حلم صغير! 🚀">
            <Textarea
              value={a.dreams}
              onChange={(e) => setA({ ...a, dreams: e.target.value })}
              placeholder="مثلاً: أريد أن أبني قمراً صناعياً صغيراً مع فريق مدرستي"
              rows={4}
              maxLength={240}
            />
          </Question>
        )}

        {step === "intents" && (
          <Question
            onBack={back}
            onSkip={finish}
            onNext={finish}
            nextLabel="إنهاء ودخول المجتمع"
            question="وأخيراً، ما نوع التفاعل الذي تبحث عنه هنا؟"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {INTENTS.map((i) => {
                const selected = a.intents.includes(i.key);
                return (
                  <button
                    key={i.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setA({ ...a, intents: toggle(a.intents, i.key) })}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-start transition-all",
                      selected ? "border-primary bg-accent shadow-glow" : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    <i.icon className="mt-0.5 size-5 text-primary" />
                    <span>
                      <span className="block font-semibold">{i.label}</span>
                      <span className="text-xs text-muted-foreground">{i.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Question>
        )}
      </main>
    </div>
  );
}

function Question({
  question,
  children,
  onBack,
  onSkip,
  onNext,
  nextLabel = "التالي",
}: {
  question: string;
  children: React.ReactNode;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="space-y-5" key={question}>
      <PhysySays>{question}</PhysySays>
      <div className="surface p-5 sm:p-6 animate-rise">
        {children}
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          إجاباتك خاصة بك. نستخدمها لاقتراح مواضيع وأصدقاء فقط، ولا تظهر للآخرين.
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowRight />
          رجوع
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSkip}>
            تخطَّ
          </Button>
          <Button variant="hero" onClick={onNext}>
            {nextLabel}
            <ArrowLeft />
          </Button>
        </div>
      </div>
    </div>
  );
}
