import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasscodeDialog } from "@/components/app/PasscodeDialog";
import { loadLocalWallet } from "@/lib/wallet";
import { getUsdcBalance } from "@/lib/onchain";
import { networkChainId } from "@/lib/chains";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Lock, Wallet, Clock, TrendingUp } from "lucide-react";

const TERMS = [
  { days: 7,   apy: 4.50 },
  { days: 30,  apy: 6.20 },
  { days: 90,  apy: 8.40 },
  { days: 180, apy: 11.0 },
];

export const Route = createFileRoute("/_authenticated/save")({
  head: () => ({ meta: [{ title: "Safe Lock — UniqueHub" }] }),
  component: SavePage,
});

function SavePage() {
  const { user } = useAuth();
  const wallet = typeof window !== "undefined" ? loadLocalWallet() : null;
  const [network, setNetwork] = useState<"mainnet" | "testnet">(wallet?.network ?? "mainnet");
  const chainId = networkChainId(network);
  const [days, setDays] = useState(30);
  const [amount, setAmount] = useState("");
  const [askPass, setAskPass] = useState(false);
  const qc = useQueryClient();

  const term = TERMS.find((t) => t.days === days)!;

  const balance = useQuery({
    enabled: !!wallet,
    queryKey: ["usdc", wallet?.address, chainId],
    queryFn: async () => (await getUsdcBalance(chainId, wallet!.address as Address)).formatted,
    refetchInterval: 20_000,
  });

  const locks = useQuery({
    queryKey: ["locks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("locks").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const projected = useMemo(() => {
    const a = Number(amount); if (!a || isNaN(a)) return 0;
    return (a * term.apy / 100) * (days / 365);
  }, [amount, days, term]);

  const valid = Number(amount) > 0 && Number(amount) <= Number(balance.data ?? 0);

  async function createLock() {
    if (!user || !wallet) return;
    const t = toast.loading("Creating lock…");
    try {
      const unlock = new Date(Date.now() + days * 86_400_000).toISOString();
      const { error } = await supabase.from("locks").insert({
        user_id: user.id,
        amount: Number(amount),
        apy_bps: Math.round(term.apy * 100),
        duration_days: days,
        unlock_at: unlock,
        token: "USDC",
        status: "active",
      });
      if (error) throw error;
      toast.success(`Locked ${amount} USDC for ${days} days`, { id: t });
      setAmount("");
      qc.invalidateQueries({ queryKey: ["locks"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create lock", { id: t });
    }
  }

  if (!wallet) {
    return (
      <>
        <PageHeader title="Safe Lock" sub="Lock stablecoins and earn predictable yield." />
        <div className="brut-sm rounded-2xl p-8 text-center bg-card">
          <Wallet className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-display text-lg">Activate a wallet to start locking</h3>
          <Button asChild className="mt-5 bg-gradient-primary text-primary-foreground"><Link to="/settings">Activate Wallet</Link></Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Safe Lock" sub="Commit USDC for a fixed term. Predictable APY. Withdraw at maturity." />

      <div className="flex items-center gap-2 mb-5 text-xs">
        {(["mainnet","testnet"] as const).map((n) => (
          <button key={n} onClick={() => setNetwork(n)} className={`px-3 py-1.5 rounded-md brut-flat capitalize ${network===n?"bg-primary text-primary-foreground":"bg-card text-muted-foreground"}`}>
            {n === "mainnet" ? "Base Mainnet" : "Base Sepolia"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="brut-sm rounded-2xl p-6 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Pick a term</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {TERMS.map((t) => (
              <button key={t.days} onClick={() => setDays(t.days)} className={`text-left rounded-xl p-3 brut-flat transition ${days===t.days ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
                <p className="text-xs opacity-80 flex items-center gap-1"><Clock className="h-3 w-3" />{t.days} days</p>
                <p className="mt-1 font-display text-xl">{t.apy.toFixed(2)}% <span className="text-xs font-body opacity-70">APY</span></p>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Amount</Label>
              <p className="text-xs text-muted-foreground">Available: <span className="font-mono">{Number(balance.data ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> USDC</p>
            </div>
            <div className="relative">
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="pr-16 text-lg font-display" />
              <button onClick={() => balance.data && setAmount(balance.data)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary px-2 py-1 rounded hover:bg-primary/10 font-medium">MAX</button>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-secondary/60 brut-flat p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-primary" />Projected yield</div>
            <p className="font-display text-lg tabular-nums">+{projected.toFixed(2)} <span className="text-xs font-body text-muted-foreground">USDC</span></p>
          </div>

          <Button disabled={!valid} onClick={() => setAskPass(true)} className="w-full mt-5 h-12 bg-gradient-primary text-primary-foreground text-base">
            <Lock className="h-4 w-4 mr-2" /> Lock {amount || "0"} USDC for {days} days
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3">Locks are non-custodial. On-chain ERC-4626 vault integration is rolling out — early locks are recorded against your account and settle once the vault is live.</p>
        </section>

        <section className="brut-sm rounded-2xl p-6 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your locks</p>
          {locks.isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : (locks.data?.length ? (
            <ul className="mt-3 divide-y divide-border">
              {locks.data.map((l) => {
                const unlockAt = new Date(l.unlock_at);
                const daysLeft = Math.max(0, Math.ceil((unlockAt.getTime() - Date.now()) / 86_400_000));
                return (
                  <li key={l.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display">{Number(l.amount).toLocaleString()} <span className="text-xs text-muted-foreground font-body">{l.token}</span></p>
                      <p className="text-xs text-muted-foreground">{l.duration_days}d · {(l.apy_bps/100).toFixed(2)}% APY</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium capitalize">{l.status}</p>
                      <p className="text-[11px] text-muted-foreground">{daysLeft > 0 ? `${daysLeft}d left` : "Unlocks today"}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No locks yet. Pick a term, deposit, and watch your USDC compound.</p>
          ))}
        </section>
      </div>

      <PasscodeDialog
        open={askPass}
        onOpenChange={setAskPass}
        title={`Lock ${amount} USDC`}
        description={`Confirms your intent for ${days} days at ${term.apy.toFixed(2)}% APY.`}
        onUnlock={async () => { await createLock(); }}
      />
    </>
  );
}