import { Link } from "@tanstack/react-router";
import { Compass, Home, Mail, MessagesSquare, PenSquare, ShieldCheck, UserRound, Info } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/common/ThemeControls";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { useProfile } from "@/lib/app-state";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Gavel } from "lucide-react";
import { useIsAdmin } from "@/components/common/AdminAccess";

const NAV = [
  { to: "/feed", label: "الرئيسية", icon: Home },
  { to: "/explore", label: "استكشف", icon: Compass },
  { to: "/chat", label: "الدردشة", icon: MessagesSquare },
  { to: "/messages", label: "الرسائل", icon: Mail },
  { to: "/rules", label: "قواعد المجتمع", icon: ShieldCheck },
  { to: "/about", label: "عن المنصة", icon: Info },
] as const;

const navLinkClass =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground";

export function SiteHeader() {
  const [profile] = useProfile();
  const { user, ready } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {NAV.map((n) => (
            <span key={n.to} className="contents">
              <Link to={n.to} className={navLinkClass}>
                <n.icon className="size-4" />
                {n.label}
              </Link>
              {n.to === "/feed" && isAdmin && (
                <Link to="/admin" className={navLinkClass}>
                  <Gavel className="size-4" />
                  لوحة الإشراف
                </Link>
              )}
            </span>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1.5">
          <Link
            to="/status"
            className="hidden rounded-full border border-dashed border-storm/50 px-2.5 py-1 text-xs text-storm transition-colors hover:bg-storm/10 sm:inline-flex sm:items-center sm:gap-1"
          >
            <Info className="size-3.5" />
            نسخة تجريبية
          </Link>
          <Button asChild variant="hero" size="sm" className="hidden md:inline-flex">
            <Link to="/submit">
              <PenSquare />
              اقترح منشوراً
            </Link>
          </Button>
          <ThemeToggle />
          {!ready ? <Button variant="ghost" size="sm" className="invisible" aria-hidden tabIndex={-1}>دخول</Button> : user ? <Button variant="ghost" size="sm" onClick={async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); }}>خروج</Button> : <Button asChild variant="ghost" size="sm"><Link to="/auth">دخول</Link></Button>}
          <Link to="/me" aria-label="حسابي" className="rounded-full ring-offset-2 ring-offset-background hover:ring-2 hover:ring-primary">
            {profile ? (
              <MemberAvatar name={profile.username} seed={profile.username} className="size-9" />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
                <UserRound className="size-4" />
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

const MOBILE = [
  { to: "/feed", label: "الرئيسية", icon: Home },
  { to: "/explore", label: "استكشف", icon: Compass },
  { to: "/submit", label: "اقترح", icon: PenSquare },
  { to: "/chat", label: "الدردشة", icon: MessagesSquare },
  { to: "/messages", label: "الرسائل", icon: Mail },
  { to: "/about", label: "عن المنصة", icon: Info },
] as const;

export function MobileNav() {
  const { isAdmin } = useIsAdmin();
  const items = isAdmin
    ? [MOBILE[0], { to: "/admin", label: "الإشراف", icon: Gavel } as const, ...MOBILE.slice(1)]
    : MOBILE;
  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[max(env(safe-area-inset-bottom),0px)] backdrop-blur-xl md:hidden"
    >
      <ul className={`mx-auto grid max-w-md ${isAdmin ? "grid-cols-7" : "grid-cols-6"}`}>
        {items.map((n) => (
          <li key={n.to}>
            <Link
              to={n.to}
              className="flex flex-col items-center gap-0.5 pb-1 pt-1.5 text-[0.65rem] text-muted-foreground data-[status=active]:text-primary"
            >
              <n.icon className="size-5" />
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
