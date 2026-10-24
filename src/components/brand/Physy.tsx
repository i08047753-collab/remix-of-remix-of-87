import type { ReactNode } from "react";
import physyImg from "@/assets/physy.png";
import { cn } from "@/lib/utils";

export function PhysyAvatar({ className, float = false, priority = false }: { className?: string; float?: boolean; priority?: boolean }) {
  return (
    <img
      src={physyImg}
      alt="فيزي، روبوت STORM WORLD"
      width={1024}
      height={1024}
      loading={priority ? "eager" : "lazy"}
      className={cn("select-none object-contain drop-shadow-[0_10px_30px_var(--primary)]", float && "animate-float", className)}
    />
  );
}

/** Speech bubble from Physy — used in onboarding and empty states. */
export function PhysySays({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-end gap-3 animate-rise", className)}>
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-accent ring-1 ring-primary/30">
        <PhysyAvatar className="size-10" />
      </div>
      <div className="surface max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 text-[0.95rem] leading-relaxed">
        <p className="mb-0.5 text-xs font-semibold text-primary">فيزي</p>
        {children}
      </div>
    </div>
  );
}
