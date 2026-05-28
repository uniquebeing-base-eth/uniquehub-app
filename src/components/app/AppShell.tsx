import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { LayoutDashboard, Lock, Sparkles, Target, Send, Settings, Shield, LogOut, ArrowDownToLine } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/deposit", label: "Deposit", icon: ArrowDownToLine },
  { to: "/spend", label: "Send", icon: Send },
  { to: "/save", label: "Safe Lock", icon: Lock },
  { to: "/earn", label: "Earn", icon: Sparkles },
  { to: "/goals", label: "Save to Get", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/security", label: "Security", icon: Shield },
] as const;

export function AppShell() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/5 bg-sidebar/40 backdrop-blur-xl p-5">
        <Logo />
        <nav className="mt-8 flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link key={to} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 pt-4 space-y-2">
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-5 h-14 border-b border-white/5 bg-background/70 backdrop-blur-xl">
          <Logo />
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <div className="mx-auto max-w-5xl px-5 py-6 md:py-10">
          <Outlet />
        </div>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/5 bg-background/85 backdrop-blur-xl">
          <div className="grid grid-cols-5 max-w-md mx-auto">
            {nav.slice(0, 5).map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className={`flex flex-col items-center gap-1 py-2 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}