import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/merchant")({
  head: () => ({ meta: [{ title: "Merchant — UniqueHub" }] }),
  component: () => (
    <>
      <PageHeader title="Merchant" sub="Accept stablecoins. Settle on-chain." action={<Button className="bg-gradient-primary text-primary-foreground">Onboard business</Button>} />
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total received" value="$0.00" />
        <Stat label="Payments" value="0" />
        <Stat label="Settlement chain" value="Base" />
      </div>
    </>
  ),
});
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="glass rounded-2xl p-5"><p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p><p className="mt-2 text-2xl font-mono font-semibold">{value}</p></div>;
}