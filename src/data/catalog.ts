import {
  Atom,
  Bot,
  BrainCircuit,
  Code2,
  Cpu,
  Dna,
  FlaskConical,
  HandHelping,
  Rocket,
  Sigma,
  Sparkles,
  Telescope,
  Users,
  Wrench,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug =
  | "physics"
  | "astronomy"
  | "biology"
  | "chemistry"
  | "technology"
  | "robotics"
  | "engineering"
  | "mathematics"
  | "programming"
  | "ai"
  | "space";

export type Category = { slug: CategorySlug; name: string; icon: LucideIcon; blurb: string };

export const CATEGORIES: Category[] = [
  { slug: "physics", name: "الفيزياء", icon: Atom, blurb: "من الكم إلى الكون" },
  { slug: "astronomy", name: "الفلك", icon: Telescope, blurb: "رصد السماء والنجوم" },
  { slug: "biology", name: "الأحياء", icon: Dna, blurb: "أسرار الحياة والخلايا" },
  { slug: "chemistry", name: "الكيمياء", icon: FlaskConical, blurb: "تفاعلات ومختبرات" },
  { slug: "technology", name: "التقنية", icon: Cpu, blurb: "أجهزة وابتكارات" },
  { slug: "robotics", name: "الروبوتات", icon: Bot, blurb: "بناء وبرمجة الآلات" },
  { slug: "engineering", name: "الهندسة", icon: Wrench, blurb: "تصميم وحلول" },
  { slug: "mathematics", name: "الرياضيات", icon: Sigma, blurb: "لغة العلوم" },
  { slug: "programming", name: "البرمجة", icon: Code2, blurb: "أفكار تتحول إلى كود" },
  { slug: "ai", name: "الذكاء الاصطناعي", icon: BrainCircuit, blurb: "تعلم الآلة والبيانات" },
  { slug: "space", name: "استكشاف الفضاء", icon: Rocket, blurb: "مهمات ورحلات" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export type IntentKey = "answer" | "feedback" | "partners" | "passion";

export type Intent = { key: IntentKey; label: string; icon: LucideIcon; hint: string };

export const INTENTS: Intent[] = [
  { key: "answer", label: "أريد إجابة", icon: HandHelping, hint: "عندي سؤال وأبحث عن شرح" },
  { key: "feedback", label: "أريد آراءكم", icon: MessagesSquare, hint: "أشارك فكرة أو مشروعاً لأسمع رأيكم" },
  { key: "partners", label: "أبحث عن شركاء", icon: Users, hint: "أريد فريقاً لمشروع أو مسابقة" },
  { key: "passion", label: "أريد مشاركة شغفي", icon: Sparkles, hint: "شيء أحببته وأريد أن أشاركه" },
];

export const intentByKey = (key: string) => INTENTS.find((i) => i.key === key);
