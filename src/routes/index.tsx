import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[480px] w-[680px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-6xl px-5 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Built on Base, Ethereum & Celo
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight text-gradient leading-[1.05]">
            Save. Earn. Spend.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground">
            Grow your money with stablecoins, smart savings vaults, and trusted DeFi infrastructure. Non-custodial. Mobile-first. Built for the next billion.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
              <Link to="/dashboard">Launch App <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
              <Link to="/save">Start Saving</Link>
            </Button>
          </div>

          {/* Hero card */}
          <div className="relative mx-auto mt-20 max-w-3xl">
            <div className="glass rounded-3xl p-8 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total balance</p>
                  <p className="mt-2 text-4xl font-semibold font-mono">$12,840.<span className="text-muted-foreground">25</span></p>
                </div>
                <span className="rounded-full bg-success/15 text-success px-3 py-1 text-xs font-medium">+4.85% APY</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Safe Lock", value: "$5,200", sub: "90 days" },
                  { label: "Earn", value: "$4,640", sub: "Flexible" },
                  { label: "Goals", value: "$3,000", sub: "2 active" },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="mt-1 font-mono font-semibold">{c.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS */}
      <Section eyebrow="The new financial OS" title="One app. Every stablecoin tool you need." sub="UniqueHub combines savings, yield, and commerce in one premium, non-custodial experience.">
        <div className="grid md:grid-cols-3 gap-4">
          <Feature icon={Lock} title="Safe Lock" desc="Lock stablecoins for fixed terms and earn predictable yield at maturity." href="/save" />
          <Feature icon={Sparkles} title="Earn" desc="Flexible vaults powered by audited DeFi protocols. Deposit and withdraw anytime." href="/earn" />
          <Feature icon={Target} title="Save to Get" desc="Set a goal, save toward it, and settle with merchants the moment you're ready." href="/goals" />
        </div>
      </Section>

      {/* NETWORKS */}
      <Section eyebrow="Supported networks" title="Built on the chains people actually use.">
        <div className="grid md:grid-cols-3 gap-4">
          <NetCard chain="Ethereum" desc="The most secure, decentralized smart contract platform. Home to deep stablecoin liquidity." color="from-indigo-500/30 to-blue-500/10"/>
          <NetCard chain="Base" desc="Coinbase's L2: low fees, fast finality, EVM-equivalent. The home of UniqueHub." color="from-blue-500/30 to-cyan-500/10"/>
          <NetCard chain="Celo" desc="Mobile-first L1 with native stablecoins like cUSD. Accessible globally with phone numbers." color="from-emerald-500/30 to-lime-500/10"/>
        </div>
      </Section>

      {/* SECURITY */}
      <Section eyebrow="Security first" title="Non-custodial by design." sub="Your keys, your coins. UniqueHub never holds your private keys.">
        <div className="grid md:grid-cols-3 gap-4">
          <Feature icon={ShieldCheck} title="Self-custody" desc="Wallet keys generated on your device. Seed phrases never leave your browser." />
          <Feature icon={Zap} title="Audited contracts" desc="Vaults built on battle-tested ERC-4626 patterns and audited protocols." />
          <Feature icon={Store} title="Transparent yield" desc="See exactly where your yield comes from — strategy, APY, and risk." />
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Everything you wanted to ask.">
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((f) => (
            <div key={f.q} className="glass rounded-2xl p-6">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 mt-24">
        <div className="glass rounded-3xl p-10 md:p-14 text-center shadow-glow">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gradient">Start saving in stablecoins today.</h2>
          <p className="mt-3 text-muted-foreground">Create your account, activate your wallet, and earn from your first deposit.</p>
          <div className="mt-7 flex justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Link to="/login">Create account</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10"><Link to="/dashboard">Launch app</Link></Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Section({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-5 mt-24">
      <div className="max-w-2xl mb-10">
        <p className="text-xs uppercase tracking-widest text-primary/80 font-medium">{eyebrow}</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
        {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Feature({ icon: Icon, title, desc, href }: { icon: typeof Lock; title: string; desc: string; href?: string }) {
  const inner = (
    <div className="glass rounded-2xl p-6 h-full group hover:bg-white/[0.06] transition-colors">
      <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      {href && <p className="mt-4 text-sm text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">Learn more <ArrowRight className="h-3.5 w-3.5"/></p>}
    </div>
  );
  return href ? <Link to={href as never}>{inner}</Link> : inner;
}

function NetCard({ chain, desc, color }: { chain: string; desc: string; color: string }) {
  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${color} blur-2xl`} />
      <p className="font-mono text-xs text-muted-foreground">CHAIN</p>
      <h3 className="mt-1 text-2xl font-semibold">{chain}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

const faqs = [
  { q: "What is UniqueHub?", a: "A non-custodial financial app for saving, earning yield on, and spending stablecoins — powered by Base, Ethereum and Celo." },
  { q: "How does Safe Lock work?", a: "Choose an amount, asset, and term (7–180 days). Funds enter an audited vault and accrue fixed yield. At maturity, withdraw principal + interest." },
  { q: "How are yields generated?", a: "From transparent DeFi strategies on protocols like Aave and Moonwell. Every strategy lists protocol, chain, APY, and risk level." },
  { q: "Is UniqueHub non-custodial?", a: "Yes. Your wallet keys are generated on your device and encrypted locally. UniqueHub never stores your seed phrase or private keys." },
  { q: "What happens at maturity?", a: "Principal and accrued yield become withdrawable. Keep it idle, redeposit, or move it to Earn." },
  { q: "Can I withdraw early?", a: "Yes — yield is forfeited and a small penalty applies. We always show terms before you confirm." },
];
