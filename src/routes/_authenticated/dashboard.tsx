import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/app/PageHeader";
import { loadLocalWallet, shortAddr } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Lock, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — UniqueHub" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const wallet = typeof window !== "undefined" ? loadLocalWallet() : null;
  const locks = useQuery({
    queryKey: ["locks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("locks").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });
  const goals = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });
  const totalLocked = (locks.data ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const totalGoals = (goals.data ?? []).reduce((s, g) => s + Number(g.current_amount), 0);
  const portfolio = totalLocked + totalGoals;
  return (
    <>
      <PageHeader title={`Hi, ${user?.email?.split("@")[0] ?? "there"}`} sub="Here's your portfolio at a glance." />
      {!wallet && (
        <div className="glass rounded-2xl p-6 mb-6 flex items-center justify-between gap-4 shadow-glow">
          <div>
            <h3 className="font-semibold">Activate your wallet</h3>
            <p className="text-sm text-muted-foreground mt-1">Generate a non-custodial wallet to deposit, save and earn.</p>
          </div>
          <Button asChild className="bg-gradient-primary text-primary-foreground"><Link to="/settings">Activate Wallet</Link></Button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Wallet} label="Portfolio" value={`$${portfolio.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <Stat icon={Lock} label="Active locks" value={String(locks.data?.filter(l => l.status === "active").length ?? 0)} />
        <Stat icon={Target} label="Active goals" value={String(goals.data?.filter(g => g.status === "active").length ?? 0)} />
        <Stat icon={TrendingUp} label="Yield earned" value="$0.00" sub="Coming soon" />
      </div>
      {wallet && (
        <div className="glass rounded-2xl p-6 mt-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Primary wallet</p>
          <p className="mt-2 font-mono text-lg">{shortAddr(wallet.address)}</p>
          <p className="text-xs text-muted-foreground mt-1">{wallet.network === "mainnet" ? "Base Mainnet" : "Base Sepolia (testnet)"}</p>
        </div>
      )}
    </>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: typeof Wallet; label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /><span className="text-xs">{label}</span></div>
      <p className="mt-3 text-2xl font-mono font-semibold">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}