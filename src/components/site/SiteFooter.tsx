import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            A crypto-native financial OS for the next billion savers.
          </p>
        </div>
        <FooterCol title="Products" links={[
          { to: "/save", label: "Safe Lock" },
          { to: "/earn", label: "Earn" },
          { to: "/goals", label: "Save to Get" },
          { to: "/spend", label: "Spend" },
        ]} />
        <FooterCol title="Business" links={[
          { to: "/merchant", label: "Merchants" },
          { to: "/security", label: "Security" },
        ]} />
        <FooterCol title="Account" links={[
          { to: "/login", label: "Sign in" },
          { to: "/dashboard", label: "Dashboard" },
        ]} />
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-5 py-5 flex justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} UniqueHub</span>
          <span className="font-mono">app.uniquehub.xyz</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}><Link to={l.to as never} className="hover:text-foreground transition-colors">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}