import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { unlockWallet } from "@/lib/wallet";
import { toast } from "sonner";
import type { Hex, Address } from "viem";

export interface UnlockedKeys { privateKey: Hex; address: Address }

export function PasscodeDialog({
  open, onOpenChange, onUnlock, title = "Confirm with passcode", description = "Enter your wallet passcode to sign this transaction.",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUnlock: (keys: UnlockedKeys) => Promise<void> | void;
  title?: string;
  description?: string;
}) {
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setPasscode(""); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Passcode</Label>
          <Input type="password" autoFocus value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="••••••••" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button
            disabled={busy || passcode.length < 6}
            onClick={async () => {
              setBusy(true);
              try {
                const keys = await unlockWallet(passcode);
                await onUnlock({ privateKey: keys.privateKey, address: keys.address });
                onOpenChange(false);
                setPasscode("");
              } catch {
                toast.error("Wrong passcode");
              } finally {
                setBusy(false);
              }
            }}
            className="bg-gradient-primary text-primary-foreground"
          >
            {busy ? "Signing…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}