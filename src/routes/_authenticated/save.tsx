import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasscodeDialog } from "@/components/app/PasscodeDialog";
import { loadLocalWallet } from "@/lib/wallet";
import { getUsdcBalance, explorerTxUrl, waitForTx } from "@/lib/onchain";
import { networkChainId } from "@/lib/chains";
import { aaveSupported, getAaveReserve, getAaveUsdcBalance, supplyUsdcToAave, withdrawUsdcFromAave } from "@/lib/aave";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Lock, Wallet, Clock, TrendingUp, ExternalLink, Sparkles, Unlock } from "lucide-react";

type LockRow = {
  id: string;
  amount: number;
  apy_bps: number;
  duration_days: number;
  unlock_at: string;
  token: string;
  status: string;
  tx_hash: string | null;
  created_at: string;
};

// Term bonus shown on top of the live Aave base rate, the longer the commitment.
const TERMS = [
  { days: 7, bonus: 0.0 },
  { days: 30, bonus: 0.6 },
  { days: 90, bonus: 1.4 },
  { days: 180, bonus: 2.5 },
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
  const supported = aaveSupported(chainId);
  const [days, setDays] = useState(30);
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<null | { type: "lock" } | { type: "withdraw"; lock: LockRow }>(null);
  const qc = useQueryClient();

  const term = TERMS.find((t) => t.days === days)!;

  const reserve = useQuery({
    enabled: supported,
    queryKey: ["aave-reserve", chainId],
    queryFn: () => getAaveReserve(chainId),
    refetchInterval: 60_000,
  });
  const baseApy = reserve.data?.supplyApy ?? 4.2;
  const effectiveApy = baseApy + term.bonus;

  const balance = useQuery({
    enabled: !!wallet,
    queryKey: ["usdc", wallet?.address, chainId],
    queryFn: async () => (await getUsdcBalance(chainId, wallet!.address as Address)).formatted,
    refetchInterval: 20_000,
  });

  const earning = useQuery({
    enabled: !!wallet && supported,
    queryKey: ["aave-balance", wallet?.address, chainId],
    queryFn: () => getAaveUsdcBalance(chainId, wallet!.address as Address),
    refetchInterval: 20_000,
  });

  const locks = useQuery({
    queryKey: ["locks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("locks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LockRow[];
    },
  });

  const projected = useMemo(() => {
    const a = Number(amount);
    if (!a || isNaN(a)) return 0;
    return (a * effectiveApy) / 100 * (days / 365);
  }, [amount, days, effectiveApy]);

  const valid = Number(amount) > 0 && Number(amount) <= Number(balance.data ?? 0);

  async function runLock(keys: { privateKey: Hex }) {
    if (!user || !wallet) return;
    const t = toast.loading("Approving & supplying to Aave…");
    try {
      const hash = await supplyUsdcToAave(chainId, keys.privateKey, amount);
      toast.loading("Confirming on Base…", { id: t });
      await waitForTx(chainId, hash);

      const unlock = new Date(Date.now() + days * 86_400_000).toISOString();
      const { error } = await supabase.from("locks").insert({
        user_id: user.id,
        amount: Number(amount),
        apy_bps: Math.round(effectiveApy * 100),
        duration_days: days,
        unlock_at: unlock,
        token: "USDC",
        status: "active",
        tx_hash: hash,
      });
      if (error) throw error;
      toast.success(`Locked ${amount} USDC — now earning ${effectiveApy.toFixed(2)}% APY`, { id: t });
      setAmount("");
      qc.invalidateQueries({ queryKey: ["locks"] });
      qc.invalidateQueries({ queryKey: ["aave-balance"] });
      qc.invalidateQueries({ queryKey: ["usdc"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lock failed", { id: t });
    }
  }

  async function runWithdraw(keys: { privateKey: Hex }, lock: LockRow) {
    if (!user) return;
    const matured = new Date(lock.unlock_at).getTime() <= Date.now();
    const t = toast.loading("Withdrawing from Aave…");
    try {
      const hash = await withdrawUsdcFromAave(chainId, keys.privateKey, String(lock.amount));
      toast.loading("Confirming on Base…", { id: t });
      await waitForTx(chainId, hash);
      const { error } = await supabase
        .from("locks")
        .update({ status: matured ? "withdrawn" : "early_exit" })
        .eq("id", lock.id);
      if (error) throw error;
      toast.success(`Withdrew ${lock.amount} USDC to your wallet`, { id: t });
      qc.invalidateQueries({ queryKey: ["locks"] });
      qc.invalidateQueries({ queryKey: ["aave-balance"] });
      qc.invalidateQueries({ queryKey: ["usdc"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Withdraw failed", { id: t });
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
      <PageHeader title="Safe Lock" sub="Commit USDC into the Aave V3 market on Base. Real on-chain yield, withdraw at maturity." />

      <div className="flex items-center gap-2 mb-5 text-xs">
        {(["mainnet", "testnet"] as const).map((n) => (
          <button key={n} onClick={() => setNetwork(n)} className={`px-3 py-1.5 rounded-md brut-flat capitalize ${network === n ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
            {n === "mainnet" ? "Base Mainnet" : "Base Sepolia"}
          </button>
        ))}
      </div>

      {!supported && (
        <div className="brut-sm rounded-2xl p-4 mb-5 bg-card text-sm text-muted-foreground">
          Aave earn is live on <span className="text-foreground font-medium">Base Mainnet</span>. Switch networks above to lock and earn real yield.
        </div>
      )}

      {supported && (
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div className="brut-sm rounded-2xl p-5 bg-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Live Aave base rate</p>
            <p className="mt-2 font-display text-3xl tabular-nums">{baseApy.toFixed(2)}<span className="text-base font-body text-muted-foreground">% APY</span></p>
            <p className="text-[11px] text-muted-foreground mt-1">USDC supply rate · Base · updates live</p>
          </div>
          <div className="brut-sm rounded-2xl p-5 bg-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" /> Your earning balance</p>
            <p className="mt-2 font-display text-3xl tabular-nums">{(earning.data ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}<span className="text-base font-body text-muted-foreground"> aUSDC</span></p>
            <p className="text-[11px] text-muted-foreground mt-1">Principal + accrued interest, growing every block</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="brut-sm rounded-2xl p-6 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Pick a term</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {TERMS.map((t) => (
              <button key={t.days} onClick={() => setDays(t.days)} className={`text-left rounded-xl p-3 brut-flat transition ${days === t.days ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
                <p className="text-xs opacity-80 flex items-center gap-1"><Clock className="h-3 w-3" />{t.days} days</p>
                <p className="mt-1 font-display text-xl">{(baseApy + t.bonus).toFixed(2)}% <span className="text-xs font-body opacity-70">APY</span></p>
                {t.bonus > 0 && <p className="text-[10px] opacity-70">+{t.bonus.toFixed(1)}% term bonus</p>}
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

          <Button disabled={!valid || !supported} onClick={() => setAction({ type: "lock" })} className="w-full mt-5 h-12 bg-gradient-primary text-primary-foreground text-base">
            <Lock className="h-4 w-4 mr-2" /> Lock {amount || "0"} USDC for {days} days
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3">Non-custodial: your USDC is supplied to the Aave V3 pool on Base and you receive interest-bearing aUSDC. Funds and yield stay in your wallet — withdrawable any time.</p>
        </section>

        <section className="brut-sm rounded-2xl p-6 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your locks</p>
          {locks.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : locks.data?.length ? (
            <ul className="mt-3 divide-y divide-border">
              {locks.data.map((l) => {
                const unlockAt = new Date(l.unlock_at);
                const matured = unlockAt.getTime() <= Date.now();
                const daysLeft = Math.max(0, Math.ceil((unlockAt.getTime() - Date.now()) / 86_400_000));
                const active = l.status === "active";
                return (
                  <li key={l.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display">{Number(l.amount).toLocaleString()} <span className="text-xs text-muted-foreground font-body">{l.token}</span></p>
                      <p className="text-xs text-muted-foreground">{l.duration_days}d · {(l.apy_bps / 100).toFixed(2)}% APY{l.tx_hash && (
                        <a className="ml-2 inline-flex items-center gap-0.5 text-primary hover:underline" target="_blank" rel="noreferrer" href={explorerTxUrl(chainId, l.tx_hash)}>tx <ExternalLink className="h-3 w-3" /></a>
                      )}</p>
                    </div>
                    <div className="text-right">
                      {active ? (
                        <Button size="sm" variant={matured ? "default" : "ghost"} className={matured ? "bg-gradient-primary text-primary-foreground" : ""} onClick={() => setAction({ type: "withdraw", lock: l })}>
                          <Unlock className="h-3 w-3 mr-1" />{matured ? "Withdraw" : `${daysLeft}d · exit`}
                        </Button>
                      ) : (
                        <p className="text-xs font-medium capitalize text-muted-foreground">{l.status.replace("_", " ")}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No locks yet. Pick a term, supply USDC, and watch your aUSDC compound.</p>
          )}
        </section>
      </div>

      <PasscodeDialog
        open={!!action}
        onOpenChange={(v) => { if (!v) setAction(null); }}
        title={action?.type === "withdraw" ? `Withdraw ${action.lock.amount} USDC` : `Lock ${amount} USDC`}
        description={action?.type === "withdraw" ? "Confirm to redeem your aUSDC back to USDC in your wallet." : `Supply to Aave for ${days} days at ${effectiveApy.toFixed(2)}% APY.`}
        onUnlock={async (keys) => {
          if (!action) return;
          if (action.type === "withdraw") await runWithdraw(keys, action.lock);
          else await runLock(keys);
        }}
      />
    </>
  );
}
