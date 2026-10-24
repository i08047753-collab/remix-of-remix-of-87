import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="sw-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--storm)" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="none" stroke="url(#sw-g)" strokeWidth="2" opacity="0.5" />
      <ellipse cx="20" cy="20" rx="18" ry="7" fill="none" stroke="url(#sw-g)" strokeWidth="1.6" transform="rotate(-25 20 20)" />
      <path d="M22.5 7 L13 22 h6.5 L16.5 33 L27 17 h-6.5 Z" fill="url(#sw-g)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="STORM WORLD — الصفحة الرئيسية">
      <LogoMark />
      {!compact && (
        <span dir="ltr" className="font-display text-lg font-bold tracking-[0.18em] text-gradient-storm">
          STORM WORLD
        </span>
      )}
    </Link>
  );
}
