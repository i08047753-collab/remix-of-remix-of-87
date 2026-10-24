import { Link } from "@tanstack/react-router";
import { categoryBySlug, intentByKey } from "@/data/catalog";
import type { SubmissionStatus } from "@/data/sample";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryChip({ slug, className }: { slug: string; className?: string }) {
  const c = categoryBySlug(slug);
  if (!c) return null;
  const Icon = c.icon;
  return (
    <Link
      to="/feed"
      search={{ topic: c.slug }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {c.name}
    </Link>
  );
}

export function IntentBadge({ intent }: { intent: string }) {
  const i = intentByKey(intent);
  if (!i) return null;
  const Icon = i.icon;
  return (
    <Badge variant="storm">
      <Icon />
      {i.label}
    </Badge>
  );
}

const STATUS = {
  pending: { label: "قيد المراجعة", icon: Clock },
  approved: { label: "مقبول ومنشور", icon: CheckCircle2 },
  rejected: { label: "مرفوض", icon: XCircle },
} as const;

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <Badge variant={status}>
      <Icon />
      {s.label}
    </Badge>
  );
}
