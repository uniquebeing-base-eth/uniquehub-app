import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-background/60">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/save" className="hover:text-foreground transition-colors">Safe Lock</Link>
          <Link to="/earn" className="hover:text-foreground transition-colors">Earn</Link>
          <Link to="/goals" className="hover:text-foreground transition-colors">Save to Get</Link>
          <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Link to="/dashboard">Launch App</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}