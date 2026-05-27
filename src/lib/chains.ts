import type { Address } from "viem";
import { base, baseSepolia, mainnet, arbitrum, optimism, polygon } from "viem/chains";

export const CHAINS = {
  base, baseSepolia, mainnet, arbitrum, optimism, polygon,
} as const;

export type Network = "mainnet" | "testnet";

export interface TokenInfo {
  symbol: string;
  address: Address | "native";
  decimals: number;
  chainId: number;
  label: string;
}

// USDC canonical addresses
export const USDC: Record<number, Address> = {
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   // Base mainnet
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",  // Base Sepolia
  1:     "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  10:    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  137:   "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
};

export function rpcFor(chainId: number): string {
  switch (chainId) {
    case 8453:  return "https://mainnet.base.org";
    case 84532: return "https://sepolia.base.org";
    case 1:     return "https://eth.llamarpc.com";
    case 42161: return "https://arb1.arbitrum.io/rpc";
    case 10:    return "https://mainnet.optimism.io";
    case 137:   return "https://polygon-rpc.com";
    default:    return "";
  }
}

export function chainName(chainId: number): string {
  switch (chainId) {
    case 8453: return "Base";
    case 84532: return "Base Sepolia";
    case 1: return "Ethereum";
    case 42161: return "Arbitrum";
    case 10: return "Optimism";
    case 137: return "Polygon";
    default: return `Chain ${chainId}`;
  }
}

export const SUPPORTED_SOURCE_CHAINS = [
  { id: 1, label: "Ethereum" },
  { id: 8453, label: "Base" },
  { id: 42161, label: "Arbitrum" },
  { id: 10, label: "Optimism" },
  { id: 137, label: "Polygon" },
];

export function networkChainId(network: Network): number {
  return network === "mainnet" ? 8453 : 84532;
}