import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/app/PageHeader";
import { loadLocalWallet, shortAddr } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { getUsdcBalance, getNativeBalance } from "@/lib/onchain";
import { networkChainId } from "@/lib/chains";
import { ArrowDownToLine, Send, Lock, Sparkles, Copy, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — UniqueHub" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const wallet = typeof window !== "undefined" ? loadLocalWallet() : null;
  const network = wallet?.network ?? "mainnet";
  const chainId = networkChainId(network);

  const balances = useQuery({
    enabled: !!wallet,
    queryKey: ["balances", wallet?.address, chainId],
    queryFn: async () => {
      const addr = wallet!.address as Address;
      const [usdc, eth] = await Promise.all([
        getUsdcBalance(chainId, addr).catch(() => ({ formatted: "0" })),
        getNativeBalance(chainId, addr).catch(() => "0"),
      ]);
      return { usdc: usdc.formatted, eth };
    },
    refetchInterval: 20_000,
  });

  const locks = useQuery({
    queryKey: ["locks", user?.id],
    queryFn: async () => (await supabase.from("locks").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const totalLocked = (locks.data ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const liquid = Number(balances.data?.usdc ?? 0);
  const portfolio = liquid + totalLocked;

  async function copyAddr() {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.address);
    toast.success("Address copied");
  }

  return (
    <>
      <PageHeader title={`Welcome, ${user?.email?.split("@")[0] ?? "there"}`} sub="Your money, working on-chain." />

      {!wallet ? (
        <div className="rounded-2xl p-6 mb-6 bg-gradient-hero text-primary-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl">Activate your wallet</h3>
            <p className="text-sm opacity-85 mt-1 max-w-md">Generate a non-custodial UniqueHub wallet to deposit, lock, send and earn — all in one place.</p>
          </div>
          <Button asChild className="bg-white text-primary hover:bg-white/90 shrink-0"><Link to="/settings">Activate Wallet</Link></Button>
        </div>
      ) : (
        <div className="rounded-2xl p-6 mb-6 bg-gradient-hero text-primary-foreground shadow-brut">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-75">Total balance</p>
              <p className="mt-2 font-display text-4xl tabular-nums">${portfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs opacity-75 mt-1">Liquid <span className="font-mono">${liquid.toFixed(2)}</span> · Locked <span className="font-mono">${totalLocked.toFixed(2)}</span></p>
            </div>
            <div className="text-right text-xs opacity-85">
              <p className="uppercase tracking-wider opacity-70">{network === "mainnet" ? "Base" : "Base Sepolia"}</p>
              <button onClick={copyAddr} className="mt-1 font-mono inline-flex items-center gap-1 hover:opacity-100 opacity-90">
                {shortAddr(wallet.address)} <Copy className="h-3 w-3" />
              </button>
              <a target="_blank" rel="noreferrer" href={`https://${network === "mainnet" ? "" : "sepolia."}basescan.org/address/${wallet.address}`} className="mt-1 inline-flex items-center gap-1 hover:underline">
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-6">
            <QuickAction to="/deposit" icon={<ArrowDownToLine className="h-4 w-4" />} label="Deposit" />
            <QuickAction to="/spend" icon={<Send className="h-4 w-4" />} label="Send" />
            <QuickAction to="/save" icon={<Lock className="h-4 w-4" />} label="Lock" />
            <QuickAction to="/earn" icon={<Sparkles className="h-4 w-4" />} label="Earn" />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="USDC" value={Number(balances.data?.usdc ?? 0).toFixed(2)} sub="Liquid · Base" loading={balances.isLoading} />
        <Stat label="ETH (gas)" value={Number(balances.data?.eth ?? 0).toFixed(5)} sub="Network fee token" loading={balances.isLoading} small />
        <Stat label="Locked" value={totalLocked.toFixed(2)} sub={`${locks.data?.filter((l) => l.status === "active").length ?? 0} active locks`} />
      </div>

      {!wallet && (
        <div className="brut-sm rounded-2xl p-6 mt-6 bg-card flex items-center gap-3">
          <Wallet className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">No wallet yet. Activate one in <Link to="/settings" className="text-primary hover:underline">Settings</Link> to start using UniqueHub.</p>
        </div>
      )}
    </>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition press">
      <div className="h-8 w-8 rounded-full bg-white/15 grid place-items-center">{icon}</div>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}

function Stat({ label, value, sub, loading, small }: { label: string; value: string; sub?: string; loading?: boolean; small?: boolean }) {
  return (
    <div className="brut-sm rounded-2xl p-5 bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`mt-2 font-display tabular-nums ${small ? "text-xl" : "text-3xl"}`}>{loading ? "…" : value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}