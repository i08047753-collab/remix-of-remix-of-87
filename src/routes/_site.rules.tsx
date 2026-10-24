import { createFileRoute } from "@tanstack/react-router";
import { EyeOff, Flag, Heart, MessageCircleHeart, ShieldCheck, ShieldOff, UserX } from "lucide-react";
import { PhysySays } from "@/components/brand/Physy";

export const Route = createFileRoute("/_site/rules")({
  head: () => ({
    meta: [
      { title: "قواعد المجتمع والأمان — STORM WORLD" },
      { name: "description", content: "قواعد بسيطة تجعل STORM WORLD مكاناً آمناً ومحترماً للطلاب ومحبي العلوم من كل الأعمار." },
      { property: "og:title", content: "قواعد مجتمع STORM WORLD" },
      { property: "og:description", content: "الاحترام، الخصوصية، والأمان أولاً." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RulesPage,
});

const RULES = [
  { icon: Heart, title: "كل سؤال مهم", text: "لا يوجد سؤال سخيف. نجيب بلطف ونشرح دون استهزاء، مهما كان مستوى السائل." },
  { icon: MessageCircleHeart, title: "انقد الفكرة لا الشخص", text: "اختلف بأدب، وقدّم رأيك بأسلوب يساعد صاحب المشروع على التحسن." },
  { icon: EyeOff, title: "احمِ خصوصيتك", text: "لا تشارك عنوانك أو رقم هاتفك أو مدرستك أو صورك الشخصية، ولا تطلبها من أحد." },
  { icon: UserX, title: "لا تواصل خارج المنصة", text: "إذا طلب منك أحد الانتقال لتطبيق آخر أو مقابلة شخصية، أبلغ عنه فوراً." },
  { icon: ShieldCheck, title: "علم صادق", text: "شارك مصادرك عندما تستطيع، وصحّح معلوماتك إذا اكتشفت خطأً. لا بأس أن نخطئ ونتعلم." },
];

const TOOLS = [
  { icon: Flag, title: "الإبلاغ", text: "من قائمة ⋯ بجانب أي منشور أو رسالة أو عضو. بلاغك سري." },
  { icon: ShieldOff, title: "الحظر", text: "احظر أي عضو فتختفي منشوراته ورسائله عنك." },
  { icon: ShieldCheck, title: "المراجعة قبل النشر", text: "يراجع فريق الإشراف كل منشور جديد قبل أن يراه الجميع." },
];

function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">قواعد المجتمع</h1>
        <p className="mt-1 text-muted-foreground">STORM WORLD بيت لكل محب للعلوم، وكثير من أعضائنا طلاب صغار. لنحافظ عليه معاً.</p>
      </div>
      <PhysySays>إذا شعرت بعدم الارتياح من أي محادثة، توقف وأبلغ عنها، وتحدث مع شخص بالغ تثق به. أنت لست وحدك 💜</PhysySays>
      <ol className="space-y-3">
        {RULES.map((r, i) => (
          <li key={r.title} className="surface flex gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent font-display text-lg font-bold text-accent-foreground">
              {i + 1}
            </span>
            <div>
              <h2 className="flex items-center gap-2 font-semibold">
                <r.icon className="size-4 text-primary" />
                {r.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <section>
        <h2 className="mb-3 text-xl font-semibold">أدوات الأمان</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {TOOLS.map((t) => (
            <div key={t.title} className="surface p-5">
              <t.icon className="size-5 text-storm" />
              <h3 className="mt-3 font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
