import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { HDKey } from "@scure/bip32";
import { privateKeyToAccount } from "viem/accounts";
import type { Address } from "viem";

// EVM derivation path
const EVM_PATH = "m/44'/60'/0'/0/0";

export function createMnemonic(strength: 128 | 256 = 128): string {
  return generateMnemonic(wordlist, strength);
}

export function isValidMnemonic(m: string): boolean {
  return validateMnemonic(m.trim(), wordlist);
}

export function mnemonicToAccount(mnemonic: string): { address: Address; privateKey: `0x${string}` } {
  const seed = mnemonicToSeedSync(mnemonic.trim());
  const hd = HDKey.fromMasterSeed(seed).derive(EVM_PATH);
  if (!hd.privateKey) throw new Error("Failed to derive key");
  const pk = `0x${Array.from(hd.privateKey).map((b) => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
  const account = privateKeyToAccount(pk);
  return { address: account.address, privateKey: pk };
}

// Local encrypted storage (AES-GCM via WebCrypto)
const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(passcode: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passcode) as BufferSource, "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 250_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function b64(buf: ArrayBuffer | Uint8Array): string {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ""; for (const v of b) s += String.fromCharCode(v);
  return btoa(s);
}
function unb64(s: string): Uint8Array {
  const bin = atob(s); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptSecret(plain: string, passcode: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passcode, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, enc.encode(plain) as BufferSource);
  return JSON.stringify({ s: b64(salt), i: b64(iv), c: b64(ct) });
}

export async function decryptSecret(payload: string, passcode: string): Promise<string> {
  const { s, i, c } = JSON.parse(payload);
  const key = await deriveKey(passcode, unb64(s));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(i) as BufferSource }, key, unb64(c) as BufferSource);
  return dec.decode(pt);
}

export const STORAGE_KEY = "uh:wallet:v1";

export interface StoredWallet {
  address: Address;
  encryptedMnemonic: string;
  createdAt: number;
  network: "testnet" | "mainnet";
}

export function loadLocalWallet(): StoredWallet | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredWallet) : null;
}

export function saveLocalWallet(w: StoredWallet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
}

export function clearLocalWallet() {
  localStorage.removeItem(STORAGE_KEY);
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export async function unlockWallet(passcode: string): Promise<{ mnemonic: string; privateKey: `0x${string}`; address: `0x${string}` }> {
  const w = loadLocalWallet();
  if (!w) throw new Error("No wallet on this device");
  const mnemonic = await decryptSecret(w.encryptedMnemonic, passcode);
  const { address, privateKey } = mnemonicToAccount(mnemonic);
  return { mnemonic, privateKey, address };
}