import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { loadLocalWallet, shortAddr } from "@/lib/wallet";
import { getUsdcBalance, getNativeBalance } from "@/lib/onchain";
import { networkChainId, chainName, SUPPORTED_SOURCE_CHAINS, USDC } from "@/lib/chains";
import { Copy, ExternalLink, Wallet } from "lucide-react";
import type { Address } from "viem";

export const Route = createFileRoute("/_authenticated/deposit")({
  head: () => ({ meta: [{ title: "Deposit — UniqueHub" }] }),
  component: DepositPage,
});

function DepositPage() {
  const wallet = typeof window !== "undefined" ? loadLocalWallet() : null;
  const [network, setNetwork] = useState<"mainnet" | "testnet">(wallet?.network ?? "mainnet");
  const chainId = networkChainId(network);

  const balances = useQuery({
    enabled: !!wallet,
    queryKey: ["balances", wallet?.address, chainId],
    queryFn: async () => {
      const addr = wallet!.address as Address;
      const [usdc, eth] = await Promise.all([
        getUsdcBalance(chainId, addr).catch(() => ({ formatted: "0", decimals: 6, raw: 0n })),
        getNativeBalance(chainId, addr).catch(() => "0"),
      ]);
      return { usdc: usdc.formatted, eth };
    },
    refetchInterval: 15_000,
  });

  if (!wallet) {
    return (
      <>
        <PageHeader title="Deposit" sub="Activate a wallet first to receive funds." />
        <div className="brut-sm rounded-2xl p-8 text-center bg-card">
          <Wallet className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-display text-lg">No wallet on this device</h3>
          <p className="text-sm text-muted-foreground mt-1">Create your non-custodial UniqueHub wallet to start depositing.</p>
          <Button asChild className="mt-5 bg-gradient-primary text-primary-foreground"><Link to="/settings">Activate Wallet</Link></Button>
        </div>
      </>
    );
  }

  async function copy(text: string) { await navigator.clipboard.writeText(text); toast.success("Copied"); }

  return (
    <>
      <PageHeader title="Deposit" sub="Receive USDC and stablecoins on Base. Cross-chain coming via Squid." />

      <div className="flex items-center gap-2 mb-5 text-xs">
        {(["mainnet","testnet"] as const).map((n) => (
          <button key={n} onClick={() => setNetwork(n)} className={`px-3 py-1.5 rounded-md brut-flat capitalize ${network===n?"bg-primary text-primary-foreground":"bg-card text-muted-foreground"}`}>
            {n === "mainnet" ? "Base Mainnet" : "Base Sepolia"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <section className="brut-sm rounded-2xl p-6 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your address · {chainName(chainId)}</p>
          <p className="mt-2 font-mono text-sm break-all">{wallet.address}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => copy(wallet.address)}><Copy className="h-3.5 w-3.5 mr-1.5" />Copy</Button>
            <a className="text-xs underline text-muted-foreground self-center inline-flex items-center gap-1" target="_blank" rel="noreferrer" href={`https://${network === "mainnet" ? "" : "sepolia."}basescan.org/address/${wallet.address}`}>
              View on BaseScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <BalanceCard label="USDC" value={balances.data?.usdc ?? "—"} symbol="USDC" loading={balances.isLoading} />
            <BalanceCard label={network === "mainnet" ? "ETH (gas)" : "ETH (sepolia)"} value={balances.data?.eth ?? "—"} symbol="ETH" loading={balances.isLoading} small />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-sm font-medium">Cross-chain deposits</p>
            <p className="text-xs text-muted-foreground mt-1">Send USDC from Ethereum, Arbitrum, Optimism, Polygon — Squid will route it to your Base address.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUPPORTED_SOURCE_CHAINS.map((c) => (
                <span key={c.id} className="text-[11px] rounded-md bg-card brut-flat px-2 py-1">{c.label}</span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">USDC contract on {chainName(chainId)}: <span className="font-mono break-all">{USDC[chainId]}</span></p>
          </div>
        </section>

        <aside className="brut rounded-2xl p-6 bg-card flex flex-col items-center">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={wallet.address} size={220} bgColor="#ffffff" fgColor="#1a2b5e" />
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">Scan to send to {shortAddr(wallet.address)}</p>
        </aside>
      </div>
    </>
  );
}

function BalanceCard({ label, value, symbol, loading, small }: { label: string; value: string; symbol: string; loading?: boolean; small?: boolean }) {
  const num = Number(value);
  const display = isNaN(num) ? value : num.toLocaleString(undefined, { maximumFractionDigits: small ? 6 : 2 });
  return (
    <div className="brut-flat rounded-xl p-4 bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-display tabular-nums">{loading ? "…" : display} <span className="text-sm text-muted-foreground font-body">{symbol}</span></p>
    </div>
  );
}