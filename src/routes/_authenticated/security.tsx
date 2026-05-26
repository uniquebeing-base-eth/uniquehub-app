import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { ShieldCheck, KeyRound, Eye, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/security")({
  head: () => ({ meta: [{ title: "Security — UniqueHub" }] }),
  component: () => (
    <>
      <PageHeader title="Security" sub="How UniqueHub protects your funds and your keys." />
      <div className="grid md:grid-cols-2 gap-4">
        <Card icon={ShieldCheck} title="Non-custodial" desc="Keys are generated and encrypted in your browser. We never store your seed phrase." />
        <Card icon={KeyRound} title="Self-sovereign" desc="You own your wallet. Export your seed phrase anytime and use any EVM wallet." />
        <Card icon={Eye} title="Transparent strategies" desc="Every vault lists its protocol, chain, APY and risk level. No hidden routing." />
        <Card icon={AlertTriangle} title="DeFi risks" desc="Smart contract risk, depeg risk and protocol risk exist. We pick conservative, audited venues." />
      </div>
    </>
  ),
});
function Card({ icon: Icon, title, desc }: { icon: typeof ShieldCheck; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow"><Icon className="h-5 w-5 text-primary-foreground"/></div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}