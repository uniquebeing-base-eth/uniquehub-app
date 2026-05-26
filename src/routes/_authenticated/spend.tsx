import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/spend")({
  head: () => ({ meta: [{ title: "Spend — UniqueHub" }] }),
  component: () => (
    <>
      <PageHeader title="Spend" sub="Send and settle in stablecoins." />
      <div className="grid md:grid-cols-3 gap-4">
        {["Send", "Receive", "Scan to pay"].map((t) => (
          <div key={t} className="glass rounded-2xl p-6"><h3 className="font-semibold">{t}</h3><p className="text-sm text-muted-foreground mt-1">Coming soon.</p></div>
        ))}
      </div>
    </>
  ),
});