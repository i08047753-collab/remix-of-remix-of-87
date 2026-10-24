import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { MobileNav, SiteHeader } from "@/components/layout/SiteHeader";
import { LogoMark } from "@/components/brand/Logo";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Outlet />
      </main>
      <footer className="mx-auto hidden max-w-6xl items-center justify-between gap-4 border-t border-border px-4 py-6 text-sm text-muted-foreground md:flex">
        <div className="flex items-center gap-2">
          <LogoMark className="size-6" />
          <span>مجتمع آمن لكل محب للعلوم</span>
        </div>
        <div className="flex gap-4">
          <Link to="/rules" className="hover:text-foreground">قواعد المجتمع</Link>
          <Link to="/status" className="hover:text-foreground">حالة المنصة</Link>
          <Link to="/settings" className="hover:text-foreground">الإعدادات</Link>
        </div>
      </footer>
      <MobileNav />
    </div>
  );
}
