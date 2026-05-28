import { Link } from "@tanstack/react-router";

export function Logo({ className = "", showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <img src="/logo.png" alt="UniqueHub" className="h-8 w-8 rounded-lg object-cover" />
      {showWordmark && <span className="font-display tracking-tight text-lg">UniqueHub</span>}
    </Link>
  );
}