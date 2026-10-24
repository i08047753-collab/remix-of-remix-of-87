import { useEffect, useState } from "react";
import { Moon, Sun, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { applyTheme, useTheme, type Theme } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function useApplyTheme() {
  const [theme] = useTheme();
  useEffect(() => {
    if (theme) applyTheme(theme);
  }, [theme]);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const current: Theme = theme ?? "dark";
  const next: Theme = current === "dark" ? "light" : "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(next)}
      aria-label={next === "light" ? "التبديل إلى المظهر الفاتح" : "التبديل إلى المظهر الداكن"}
    >
      {current === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

export function ThemeOptionCards({ value, onPick }: { value: Theme | null; onPick: (t: Theme) => void }) {
  const options: { key: Theme; label: string; hint: string }[] = [
    { key: "dark", label: "الفضاء الداكن", hint: "أسود عميق ونجوم هادئة" },
    { key: "light", label: "المختبر الأبيض", hint: "أبيض نظيف ومريح للقراءة" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((o) => {
        const selected = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onPick(o.key)}
            aria-pressed={selected}
            className={cn(
              "group relative overflow-hidden rounded-2xl border-2 p-3 text-start transition-all",
              selected ? "border-primary shadow-glow" : "border-border hover:border-primary/50",
            )}
          >
            <div className={cn(o.key, "mb-3 overflow-hidden rounded-xl border border-border")}>
              <div className="starfield space-y-1.5 bg-background p-3">
                <div className="h-2 w-10 rounded-full bg-gradient-storm" />
                <div className="h-6 rounded-md bg-card" />
                <div className="h-6 rounded-md bg-card" />
              </div>
            </div>
            <div className="flex items-center gap-2 font-display font-semibold">
              {o.key === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              {o.label}
            </div>
            <p className="text-xs text-muted-foreground">{o.hint}</p>
            {selected && (
              <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Shown once on first visit until the visitor picks a theme. */
export function FirstVisitThemePicker() {
  const [theme, setTheme] = useTheme();
  const [mounted, setMounted] = useState(false);
  // Open shortly after load so the page finishes hydrating before the modal hides it from screen readers.
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 600);
    return () => window.clearTimeout(t);
  }, []);
  const open = mounted && theme === null;
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-display text-2xl">أهلاً بك في STORM WORLD</DialogTitle>
          <DialogDescription>اختر المظهر الذي يريح عينيك. يمكنك تغييره لاحقاً من الإعدادات.</DialogDescription>
        </DialogHeader>
        <ThemeOptionCards value={null} onPick={(t) => setTheme(t)} />
      </DialogContent>
    </Dialog>
  );
}
