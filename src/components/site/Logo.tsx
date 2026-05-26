import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
        <span className="text-primary-foreground font-bold text-sm">U</span>
        <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
      </div>
      <span className="font-semibold tracking-tight">UniqueHub</span>
    </Link>
  );
}