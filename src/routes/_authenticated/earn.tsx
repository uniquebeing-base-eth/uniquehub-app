import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_authenticated/earn")({
  head: () => ({ meta: [{ title: "Earn — UniqueHub" }] }),
  component: Earn,
});

function Earn() {
  const { data } = useQuery({
    queryKey: ["strategies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("strategies").select("*").eq("is_active", true);
      if (error) throw error; return data;
    },
  });
  return (
    <>
      <PageHeader title="Earn" sub="Flexible stablecoin vaults. Deposit and withdraw anytime." />
      <div className="grid md:grid-cols-2 gap-4">
        {(data ?? []).map((s) => (
          <div key={s.id} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.protocol} · {s.chain}</p>
              </div>
              <span className="rounded-full bg-success/15 text-success px-3 py-1 text-xs font-mono">{(s.current_apy_bps/100).toFixed(2)}% APY</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{s.description}</p>
            <div className="mt-4 flex gap-2 text-xs"><span className="rounded-md bg-white/5 px-2 py-1">{s.token}</span><span className="rounded-md bg-white/5 px-2 py-1 capitalize">{s.risk_level} risk</span></div>
          </div>
        ))}
      </div>
    </>
  );
}