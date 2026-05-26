import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — UniqueHub" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate, search.redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/dashboard" },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign in failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center"><Logo /></div>
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="text-sm text-muted-foreground">Save, earn and spend stablecoins.</p>
          </div>
          <Button onClick={google} disabled={busy} variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10">
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-white/10"/>or email<div className="h-px flex-1 bg-white/10"/></div>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@uniquehub.xyz"/></div>
            <div className="space-y-1.5"><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••"/></div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to UniqueHub? " : "Already have an account? "}
            <button onClick={()=>setMode(mode==="signin"?"signup":"signin")} className="text-primary hover:underline">
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back home</Link>
        </p>
      </div>
    </div>
  );
}