import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/save")({
  head: () => ({ meta: [{ title: "Safe Lock — UniqueHub" }] }),
  component: () => (
    <>
      <PageHeader title="Safe Lock" sub="Lock stablecoins for fixed terms and earn predictable yield." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[7, 30, 90, 180].map((d) => (
          <div key={d} className="glass rounded-2xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{d} days</p>
            <p className="mt-2 text-2xl font-semibold font-mono">{(4 + d / 60).toFixed(2)}% <span className="text-sm text-muted-foreground">APY</span></p>
            <p className="text-xs text-muted-foreground mt-1">USDC · DAI · cUSD</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-6">Vault deposits open once your wallet is funded. Activate your wallet from Settings.</p>
    </>
  ),
});