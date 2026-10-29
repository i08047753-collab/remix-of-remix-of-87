import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { checkIsAdmin, verifyAdminCode } from "@/lib/admin-access.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UNLOCK_KEY = "sw-admin-unlocked";

export function useIsAdmin() {
  const { user, ready } = useAuth();
  const q = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => checkIsAdmin(),
    enabled: ready && !!user,
    staleTime: 5 * 60_000,
  });
  return { isAdmin: !!user && q.data?.admin === true, loading: !ready || (!!user && q.isLoading) };
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useIsAdmin();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(UNLOCK_KEY) === "1");
  }, []);

  if (loading) return <p className="py-16 text-center text-muted-foreground">جارٍ التحقق…</p>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
        <Lock className="mx-auto size-8 text-muted-foreground" />
        <p className="font-medium">هذه الصفحة متاحة للمشرفين فقط.</p>
        <Button asChild variant="outline"><Link to="/feed">العودة للرئيسية</Link></Button>
      </div>
    );
  if (unlocked) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await verifyAdminCode({ data: { code } });
      if (r.ok) {
        sessionStorage.setItem(UNLOCK_KEY, "1");
        setUnlocked(true);
      } else setError("الرمز غير صحيح.");
    } catch {
      setError("تعذّر التحقق. حاول مجدداً.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
      <Lock className="mx-auto size-8 text-primary" />
      <h1 className="text-xl font-bold">لوحة الإشراف</h1>
      <p className="text-sm text-muted-foreground">أدخل رمز الدخول للمتابعة</p>
      <Input type="password" inputMode="numeric" autoFocus value={code} onChange={(e) => setCode(e.target.value)} aria-label="رمز الدخول" className="text-center" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy || !code}>دخول</Button>
    </form>
  );
}
