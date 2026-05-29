import { createPublicClient, createWalletClient, http, parseUnits, formatUnits, erc20Abi, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { rpcFor, USDC } from "./chains";

export function publicClientFor(chainId: number) {
  return createPublicClient({ transport: http(rpcFor(chainId)) });
}

export async function getNativeBalance(chainId: number, address: Address): Promise<string> {
  const c = publicClientFor(chainId);
  const v = await c.getBalance({ address });
  return formatUnits(v, 18);
}

export async function getErc20Balance(chainId: number, token: Address, address: Address): Promise<{ raw: bigint; formatted: string; decimals: number }> {
  const c = publicClientFor(chainId);
  const [raw, decimals] = await Promise.all([
    c.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [address] }) as Promise<bigint>,
    c.readContract({ address: token, abi: erc20Abi, functionName: "decimals" }) as Promise<number>,
  ]);
  return { raw, formatted: formatUnits(raw, decimals), decimals };
}

export async function getUsdcBalance(chainId: number, address: Address) {
  const token = USDC[chainId];
  if (!token) throw new Error(`USDC not configured for chain ${chainId}`);
  return getErc20Balance(chainId, token, address);
}

export function accountFromPk(pk: Hex) {
  return privateKeyToAccount(pk);
}

export async function waitForTx(chainId: number, hash: Hex) {
  const c = publicClientFor(chainId);
  return c.waitForTransactionReceipt({ hash });
}

export async function getAllowance(chainId: number, token: Address, owner: Address, spender: Address): Promise<bigint> {
  const c = publicClientFor(chainId);
  return c.readContract({ address: token, abi: erc20Abi, functionName: "allowance", args: [owner, spender] }) as Promise<bigint>;
}

export async function approveErc20(chainId: number, pk: Hex, token: Address, spender: Address, amount: string, decimals: number): Promise<Hex> {
  const account = accountFromPk(pk);
  const wallet = createWalletClient({ account, transport: http(rpcFor(chainId)) });
  return wallet.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, parseUnits(amount, decimals)],
    chain: null,
  });
}

export async function sendNative(chainId: number, pk: Hex, to: Address, amountEth: string): Promise<Hex> {
  const account = accountFromPk(pk);
  const wallet = createWalletClient({ account, transport: http(rpcFor(chainId)) });
  return wallet.sendTransaction({ to, value: parseUnits(amountEth, 18), chain: null });
}

export async function sendErc20(chainId: number, pk: Hex, token: Address, to: Address, amount: string, decimals: number): Promise<Hex> {
  const account = accountFromPk(pk);
  const wallet = createWalletClient({ account, transport: http(rpcFor(chainId)) });
  return wallet.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, parseUnits(amount, decimals)],
    chain: null,
  });
}

export async function sendUsdc(chainId: number, pk: Hex, to: Address, amount: string): Promise<Hex> {
  const token = USDC[chainId];
  if (!token) throw new Error("USDC not on this chain");
  return sendErc20(chainId, pk, token, to, amount, 6);
}

export function explorerTxUrl(chainId: number, hash: string): string {
  switch (chainId) {
    case 8453:  return `https://basescan.org/tx/${hash}`;
    case 84532: return `https://sepolia.basescan.org/tx/${hash}`;
    case 1:     return `https://etherscan.io/tx/${hash}`;
    case 42161: return `https://arbiscan.io/tx/${hash}`;
    case 10:    return `https://optimistic.etherscan.io/tx/${hash}`;
    case 137:   return `https://polygonscan.com/tx/${hash}`;
    default: return "#";
  }
}