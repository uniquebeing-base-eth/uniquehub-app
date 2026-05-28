import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { isAddress, type Address } from "viem";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadLocalWallet } from "@/lib/wallet";
import { getUsdcBalance, sendUsdc, explorerTxUrl } from "@/lib/onchain";
import { networkChainId, chainName } from "@/lib/chains";
import { PasscodeDialog } from "@/components/app/PasscodeDialog";
import { ArrowUpRight, Send, Wallet, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/spend")({
  head: () => ({ meta: [{ title: "Send — UniqueHub" }] }),
  component: SendPage,
});

function SendPage() {
  const wallet = typeof window !== "undefined" ? loadLocalWallet() : null;
  const [network, setNetwork] = useState<"mainnet" | "testnet">(wallet?.network ?? "mainnet");
  const chainId = networkChainId(network);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [askPass, setAskPass] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const qc = useQueryClient();

  const balance = useQuery({
    enabled: !!wallet,
    queryKey: ["usdc", wallet?.address, chainId],
    queryFn: async () => (await getUsdcBalance(chainId, wallet!.address as Address)).formatted,
    refetchInterval: 20_000,
  });

  const valid = useMemo(() => {
    if (!recipient || !amount) return false;
    if (!isAddress(recipient)) return false;
    const a = Number(amount);
    if (isNaN(a) || a <= 0) return false;
    if (balance.data && Number(balance.data) < a) return false;
    return true;
  }, [recipient, amount, balance.data]);

  if (!wallet) {
    return (
      <>
        <PageHeader title="Send" sub="Activate a wallet to send stablecoins." />
        <div className="brut-sm rounded-2xl p-8 text-center bg-card">
          <Wallet className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-display text-lg">No wallet on this device</h3>
          <Button asChild className="mt-5 bg-gradient-primary text-primary-foreground"><Link to="/settings">Activate Wallet</Link></Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Send" sub="Move USDC anywhere on the network. Instant, low-fee, self-custodial." />

      <div className="flex items-center gap-2 mb-5 text-xs">
        {(["mainnet","testnet"] as const).map((n) => (
          <button key={n} onClick={() => setNetwork(n)} className={`px-3 py-1.5 rounded-md brut-flat capitalize ${network===n?"bg-primary text-primary-foreground":"bg-card text-muted-foreground"}`}>
            {n === "mainnet" ? "Base Mainnet" : "Base Sepolia"}
          </button>
        ))}
      </div>

      <section className="brut-sm rounded-2xl p-6 bg-card max-w-xl">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Available · {chainName(chainId)}</p>
          <p className="font-display text-lg tabular-nums">{balance.isLoading ? "…" : Number(balance.data ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs text-muted-foreground font-body">USDC</span></p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Recipient address</Label>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value.trim())} placeholder="0x…" className="font-mono text-sm" />
            {recipient && !isAddress(recipient) && <p className="text-xs text-destructive">Not a valid EVM address</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Amount (USDC)</Label>
            <div className="relative">
              <Input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="pr-16 text-lg font-display" />
              <button type="button" onClick={() => balance.data && setAmount(balance.data)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary px-2 py-1 rounded hover:bg-primary/10">MAX</button>
            </div>
          </div>

          <Button disabled={!valid} onClick={() => setAskPass(true)} className="w-full bg-gradient-primary text-primary-foreground h-12 text-base">
            <Send className="h-4 w-4 mr-2" /> Send USDC
          </Button>

          {lastTx && (
            <a href={explorerTxUrl(chainId, lastTx)} target="_blank" rel="noreferrer" className="block text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2">
              View last transaction <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-4 mt-6 max-w-xl">
        <ActionTile to="/deposit" icon={<ArrowUpRight className="h-4 w-4 rotate-180" />} title="Deposit" sub="Receive funds" />
        <ActionTile to="/save" icon={<ArrowUpRight className="h-4 w-4" />} title="Safe Lock" sub="Earn predictable yield" />
      </div>

      <PasscodeDialog
        open={askPass}
        onOpenChange={setAskPass}
        title={`Send ${amount} USDC`}
        description={`To ${recipient.slice(0, 10)}… on ${chainName(chainId)}`}
        onUnlock={async ({ privateKey }) => {
          const t = toast.loading("Broadcasting transaction…");
          try {
            const hash = await sendUsdc(chainId, privateKey, recipient as Address, amount);
            setLastTx(hash);
            toast.success("Sent", { id: t, description: `Tx ${hash.slice(0, 10)}…` });
            setAmount("");
            qc.invalidateQueries({ queryKey: ["usdc"] });
            qc.invalidateQueries({ queryKey: ["balances"] });
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Transaction failed", { id: t });
          }
        }}
      />
    </>
  );
}

function ActionTile({ to, icon, title, sub }: { to: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Link to={to} className="brut-flat rounded-xl p-4 bg-card hover:shadow-brut transition press flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">{icon}</div>
      <div><p className="font-medium text-sm">{title}</p><p className="text-xs text-muted-foreground">{sub}</p></div>
    </Link>
  );
}