import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { loadLocalWallet } from "@/lib/wallet";
import { networkChainId } from "@/lib/chains";
import { aaveSupported, getAaveReserve, getAaveUsdcBalance } from "@/lib/aave";
import { Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/earn")({
  head: () => ({ meta: [{ title: "Earn — UniqueHub" }] }),
  component: Earn,
});

function Earn() {
  const wallet = typeof window !== "undefined" ? loadLocalWallet() : null;
  const chainId = networkChainId(wallet?.network ?? "mainnet");
  const supported = aaveSupported(chainId);

  const reserve = useQuery({
    enabled: supported,
    queryKey: ["aave-reserve", chainId],
    queryFn: () => getAaveReserve(chainId),
    refetchInterval: 60_000,
  });
  const earning = useQuery({
    enabled: !!wallet && supported,
    queryKey: ["aave-balance", wallet?.address, chainId],
    queryFn: () => getAaveUsdcBalance(chainId, wallet!.address as Address),
    refetchInterval: 20_000,
  });

  const { data } = useQuery({
    queryKey: ["strategies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("strategies").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHeader title="Earn" sub="Put idle stablecoins to work with audited on-chain markets." />

      {supported && (
        <div className="rounded-2xl p-6 mb-5 bg-gradient-hero text-primary-foreground shadow-brut">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Aave V3 · Base · USDC</p>
              <p className="mt-2 font-display text-4xl tabular-nums">{(reserve.data?.supplyApy ?? 0).toFixed(2)}<span className="text-base font-body opacity-80">% APY</span></p>
              <p className="text-xs opacity-80 mt-1">Live supply rate · interest accrues every block</p>
            </div>
            <div className="text-right text-xs opacity-90">
              <p className="uppercase tracking-wider opacity-75">Your position</p>
              <p className="mt-1 font-display text-lg">{(earning.data ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} aUSDC</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {(data ?? []).map((s) => (
          <div key={s.id} className="brut-sm rounded-2xl p-6 bg-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-1"><Sparkles className="h-4 w-4 text-primary" />{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.protocol} · {s.chain}</p>
              </div>
              <span className="rounded-full bg-success/15 text-success px-3 py-1 text-xs font-mono">{(s.current_apy_bps / 100).toFixed(2)}% APY</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{s.description}</p>
            <div className="mt-4 flex gap-2 text-xs"><span className="rounded-md bg-secondary px-2 py-1">{s.token}</span><span className="rounded-md bg-secondary px-2 py-1 capitalize">{s.risk_level} risk</span></div>
          </div>
        ))}
      </div>
    </>
  );
}
