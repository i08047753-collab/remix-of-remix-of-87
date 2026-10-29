import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/storm-logo.png.asset.json";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt=""
      width={512}
      height={512}
      className={cn("size-9 shrink-0 rounded-[22%] object-cover", className)}
    />
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
