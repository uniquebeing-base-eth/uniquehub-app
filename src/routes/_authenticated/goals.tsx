import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({ meta: [{ title: "Save to Get — UniqueHub" }] }),
  component: () => (
    <>
      <PageHeader title="Save to Get" sub="Set a goal, save toward it, settle with merchants." action={<Button className="bg-gradient-primary text-primary-foreground">New goal</Button>} />
      <div className="glass rounded-2xl p-10 text-center">
        <h3 className="font-semibold">No goals yet</h3>
        <p className="text-sm text-muted-foreground mt-2">Pick something worth saving for — a phone, rent, travel — and start a goal.</p>
      </div>
    </>
  ),
});