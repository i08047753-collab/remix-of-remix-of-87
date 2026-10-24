import { cn } from "@/lib/utils";

const TONES = [
  "bg-primary/15 text-primary ring-primary/30",
  "bg-storm/15 text-storm ring-storm/30",
  "bg-success/15 text-success ring-success/30",
  "bg-warning/20 text-warning-foreground ring-warning/40 dark:text-warning",
  "bg-accent text-accent-foreground ring-primary/20",
];

function tone(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function MemberAvatar({ name, seed, className }: { name: string; seed: string; className?: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "؟";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full font-display text-base font-bold ring-1",
        tone(seed),
        className,
      )}
    >
      {letter}
    </span>
  );
}
