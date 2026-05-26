import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  createMnemonic, mnemonicToAccount, encryptSecret, decryptSecret,
  saveLocalWallet, loadLocalWallet, clearLocalWallet, shortAddr, isValidMnemonic,
} from "@/lib/wallet";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — UniqueHub" }] }),
  component: SettingsPage,
});

type Step = "idle" | "explain" | "reveal" | "confirm" | "done";

function SettingsPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(() => (typeof window !== "undefined" ? loadLocalWallet() : null));
  const [network, setNetwork] = useState<"testnet" | "mainnet">(wallet?.network ?? "testnet");
  const [step, setStep] = useState<Step>("idle");
  const [mnemonic, setMnemonic] = useState("");
  const [address, setAddress] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [confirmWord, setConfirmWord] = useState({ idx: 0, value: "" });
  const [importMode, setImportMode] = useState(false);
  const [importSeed, setImportSeed] = useState("");

  function startActivation() {
    const m = createMnemonic();
    const { address } = mnemonicToAccount(m);
    setMnemonic(m); setAddress(address); setStep("explain");
  }

  async function finalize(seed: string, pc: string) {
    if (!isValidMnemonic(seed)) { toast.error("Invalid seed phrase"); return; }
    if (pc.length < 6) { toast.error("Passcode must be at least 6 characters"); return; }
    const { address } = mnemonicToAccount(seed);
    const encrypted = await encryptSecret(seed, pc);
    const w = { address, encryptedMnemonic: encrypted, createdAt: Date.now(), network };
    saveLocalWallet(w);
    setWallet(w);
    if (user) {
      await supabase.from("wallets").upsert({
        user_id: user.id, address, chain_id: network === "mainnet" ? 8453 : 84532, is_primary: true,
      }, { onConflict: "user_id,address,chain_id" });
    }
    setStep("done");
    toast.success("Wallet activated");
  }

  async function copy(text: string) { await navigator.clipboard.writeText(text); toast.success("Copied"); }

  const words = mnemonic.split(" ");

  return (
    <>
      <PageHeader title="Settings" sub="Profile, wallet and security." />

      {/* Account */}
      <section className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
      </section>

      {/* Wallet */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold">Wallet</h2>
            <p className="text-sm text-muted-foreground mt-1">Non-custodial. Keys stay on this device, encrypted with your passcode.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 p-1 text-xs">
            {(["testnet","mainnet"] as const).map((n) => (
              <button key={n} onClick={() => setNetwork(n)} className={`px-3 py-1.5 rounded-md capitalize ${network===n?"bg-white/10 text-foreground":"text-muted-foreground"}`}>{n}</button>
            ))}
          </div>
        </div>

        {wallet ? (
          <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p>
                <p className="mt-1 font-mono text-sm break-all">{wallet.address}</p>
                <p className="text-xs text-muted-foreground mt-2">{wallet.network === "mainnet" ? "Base Mainnet (8453)" : "Base Sepolia (84532)"}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => copy(wallet.address)} className="bg-white/5 border-white/10"><Copy className="h-3.5 w-3.5"/></Button>
            </div>
            <div className="mt-4 flex justify-center bg-white p-3 rounded-lg w-fit">
              <QRCodeSVG value={wallet.address} size={140} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="bg-white/5 border-white/10" onClick={() => { if (confirm("Remove wallet from this device? Make sure you have your seed phrase backed up.")) { clearLocalWallet(); setWallet(null); }}}>
                Remove from device
              </Button>
            </div>
          </div>
        ) : step === "idle" ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={startActivation} className="bg-gradient-primary text-primary-foreground">Activate Wallet</Button>
            <Button variant="outline" className="bg-white/5 border-white/10" onClick={() => { setImportMode(true); setStep("confirm"); }}>Import existing</Button>
          </div>
        ) : null}

        {step === "explain" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5"/>
              <div className="text-sm">
                <p className="font-medium">You are about to create a self-custody wallet.</p>
                <p className="text-muted-foreground mt-1">Your seed phrase is the master key. UniqueHub never sees it. If you lose it, your funds are unrecoverable.</p>
              </div>
            </div>
            <Button onClick={() => setStep("reveal")} className="bg-gradient-primary text-primary-foreground">I understand — reveal seed phrase</Button>
          </div>
        )}

        {step === "reveal" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-white/10 p-5 bg-black/30 relative">
              <button onClick={() => setShowSeed(s => !s)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                {showSeed ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </button>
              <div className={`grid grid-cols-3 gap-2 ${showSeed ? "" : "blur-md select-none"}`}>
                {words.map((w, i) => (
                  <div key={i} className="rounded-md bg-white/5 px-3 py-2 font-mono text-sm"><span className="text-muted-foreground mr-2">{i+1}.</span>{w}</div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Address: <span className="font-mono">{shortAddr(address)}</span></p>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/5 border-white/10" onClick={() => copy(mnemonic)}>Copy phrase</Button>
              <Button onClick={() => { setConfirmWord({ idx: Math.floor(Math.random()*12), value: "" }); setStep("confirm"); }} className="bg-gradient-primary text-primary-foreground">I saved it — continue</Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="mt-5 space-y-4">
            {importMode ? (
              <div className="space-y-2">
                <Label>Paste your 12-word seed phrase</Label>
                <textarea value={importSeed} onChange={(e)=>setImportSeed(e.target.value)} rows={3} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm"/>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Confirm word #{confirmWord.idx + 1}</Label>
                <Input value={confirmWord.value} onChange={(e)=>setConfirmWord({ ...confirmWord, value: e.target.value })} placeholder={`Word ${confirmWord.idx + 1}`} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Encryption passcode (min 6 chars)</Label>
              <Input type="password" value={passcode} onChange={(e)=>setPasscode(e.target.value)} placeholder="Used only to encrypt your seed phrase on this device" />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => { setStep("idle"); setImportMode(false); setMnemonic(""); setImportSeed(""); }}>Cancel</Button>
              <Button
                className="bg-gradient-primary text-primary-foreground"
                onClick={async () => {
                  if (importMode) { await finalize(importSeed.trim().toLowerCase(), passcode); }
                  else {
                    if (confirmWord.value.trim().toLowerCase() !== words[confirmWord.idx]) { toast.error("Word doesn't match"); return; }
                    await finalize(mnemonic, passcode);
                  }
                }}
              >Activate</Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="mt-5 rounded-xl border border-success/30 bg-success/5 p-4 flex gap-3">
            <Check className="h-5 w-5 text-success shrink-0 mt-0.5"/>
            <div className="text-sm">
              <p className="font-medium">Wallet activated.</p>
              <p className="text-muted-foreground mt-1">You can now deposit stablecoins and start earning.</p>
            </div>
          </div>
        )}
      </section>

      {/* Reveal seed (existing wallet) */}
      {wallet && <RevealSeed encrypted={wallet.encryptedMnemonic} />}
    </>
  );
}

function RevealSeed({ encrypted }: { encrypted: string }) {
  const [pc, setPc] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  async function reveal() {
    try { const m = await decryptSecret(encrypted, pc); setRevealed(m); }
    catch { toast.error("Wrong passcode"); }
  }
  return (
    <section className="glass rounded-2xl p-6 mb-6">
      <h2 className="font-semibold">Seed phrase</h2>
      <p className="text-sm text-muted-foreground mt-1">Enter your passcode to reveal. Keep it secret.</p>
      {!revealed ? (
        <div className="mt-4 flex gap-2">
          <Input type="password" value={pc} onChange={(e)=>setPc(e.target.value)} placeholder="Passcode" />
          <Button onClick={reveal} variant="outline" className="bg-white/5 border-white/10">Reveal</Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {revealed.split(" ").map((w, i) => (
            <div key={i} className="rounded-md bg-white/5 px-3 py-2 font-mono text-sm"><span className="text-muted-foreground mr-2">{i+1}.</span>{w}</div>
          ))}
        </div>
      )}
    </section>
  );
}