import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, FlaskConical, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/status")({
  head: () => ({
    meta: [
      { title: "حالة المنصة — ما يعمل وما هو تجريبي | STORM WORLD" },
      { name: "description", content: "قائمة واضحة بما يعمل في النسخة الأولى من STORM WORLD وما يزال تجريبياً بانتظار الخادم." },
      { property: "og:title", content: "حالة منصة STORM WORLD" },
      { property: "og:description", content: "ما يعمل الآن وما هو قادم." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatusPage,
});

const WORKS = [
  "تسجيل الدخول الآمن للنشر بالبريد أو Google أو Lovable",
  "إرسال منشورات ومقالات برمز نشر يتحقق منه الخادم، مع حدود للمحاولات",
  "مرفقات خاصة والتحقق من نوع الملف وحجمه قبل الحفظ",
  "مراجعة المسؤول وقبول المحتوى قبل نشره للجميع",
  "التصميم العربي من اليمين لليسار على الحاسوب والجوال",
  "اختيار المظهر الداكن أو الفاتح وتغييره لاحقاً",
  "الترحيب مع فيزي واختيار اسم المستخدم والنبذة والأسئلة الاختيارية",
  "تصفح المنشورات حسب المجال، والبحث في المنشورات والأعضاء",
  "الحظر وإخفاء منشورات المحظورين (على هذا الجهاز)",
];

const DEMO = [
  "ملف التعارف والاهتمامات: محفوظة على جهازك فقط، منفصلة عن حساب الدخول",
  "الاقتراحات القديمة المحفوظة على الجهاز: لا تُرفع تلقائياً",
  "لوحة المؤسس: التبويبات غير المراجعة ما تزال للمعاينة",
  "البلاغات والردود وطلبات الانضمام للغرف الخاصة: شكل فقط",
  "غرف النقاش: لا توجد غرف متصلة حالياً، والإرسال مُعطّل",
];

const LATER = [
  "غرف الصوت والفيديو عبر مزود آمن",
  "إشعارات بالردود ونتائج المراجعة",
];

const BACKEND = [
  "قاعدة بيانات للأعضاء والمنشورات والغرف والبلاغات",
  "ربط ملفات التعارف بحسابات الدخول بموافقة أصحابها",
  "تعيين حساب المسؤول بعد التسجيل؛ لا يحصل أي حساب على هذه الصلاحية تلقائياً",
  "قواعد وصول تمنع أي عضو من نشر منشور دون موافقة، وتبقي إجابات التعارف خاصة بصاحبها",
  "رسائل فورية للغرف، مع صلاحيات للغرف الخاصة",
];

function Column({ title, icon: Icon, items, tone }: { title: string; icon: typeof Clock; items: string[]; tone: string }) {
  return (
    <section className="surface p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className={`size-5 ${tone}`} />
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5 text-sm leading-relaxed">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-50" />
            {i}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">حالة المنصة</h1>
        <p className="mt-1 text-muted-foreground">هذه هي المرحلة الأولى: التصميم والتنقل. إليك بوضوح ما يعمل وما هو تجريبي.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Column title="يعمل الآن" icon={CheckCircle2} items={WORKS} tone="text-success" />
        <Column title="تجريبي — يحتاج خادماً" icon={FlaskConical} items={DEMO} tone="text-storm" />
        <Column title="مرحلة لاحقة" icon={Clock} items={LATER} tone="text-warning" />
      </div>
      <section className="rounded-2xl border border-primary/25 bg-accent/40 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Server className="size-5 text-primary" />
          ما نحتاجه للمرحلة القادمة
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed">
          {BACKEND.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {b}
            </li>
          ))}
        </ul>
      </section>
      <Button asChild variant="outline">
        <Link to="/admin">معاينة لوحة المؤسس</Link>
      </Button>
    </div>
  );
}
