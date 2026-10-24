import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Marks a screen or control that is a design preview and not yet connected to a server. */
export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-dashed border-storm/40 bg-storm/5 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-storm" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
