import { createWalletClient, http, parseUnits, type Address, type Hex } from "viem";
import { maxUint256 } from "viem";
import { publicClientFor, accountFromPk, getAllowance, approveErc20, waitForTx } from "./onchain";
import { rpcFor, USDC } from "./chains";

// Aave V3 deployment on Base mainnet (chainId 8453)
export const AAVE_POOL: Record<number, Address> = {
  8453: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
};

// Fallback aToken (aBasUSDC) — we prefer reading it on-chain, this is the safety net
const ABAS_USDC: Address = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB";

const RAY = 10n ** 27n;

export function aaveSupported(chainId: number): boolean {
  return !!AAVE_POOL[chainId] && !!USDC[chainId];
}

const poolAbi = [
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getReserveData",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        type: "tuple",
        name: "",
        components: [
          { name: "configuration", type: "tuple", components: [{ name: "data", type: "uint256" }] },
          { name: "liquidityIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "id", type: "uint16" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury", type: "uint128" },
          { name: "unbacked", type: "uint128" },
          { name: "isolationModeTotalDebt", type: "uint128" },
        ],
      },
    ],
  },
] as const;

const aTokenAbi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

export interface AaveReserveInfo {
  aToken: Address;
  /** Supply APR as a percentage number, e.g. 4.21 */
  supplyApy: number;
}

/** Reads the live USDC reserve (aToken address + supply APR). Returns null on any failure. */
export async function getAaveReserve(chainId: number): Promise<AaveReserveInfo | null> {
  const pool = AAVE_POOL[chainId];
  const usdc = USDC[chainId];
  if (!pool || !usdc) return null;
  try {
    const c = publicClientFor(chainId);
    const data = (await c.readContract({
      address: pool,
      abi: poolAbi,
      functionName: "getReserveData",
      args: [usdc],
    })) as { currentLiquidityRate: bigint; aTokenAddress: Address };
    // currentLiquidityRate is the supply APR in RAY (1e27)
    const aprRay = data.currentLiquidityRate ?? 0n;
    const supplyApy = Number((aprRay * 10000n) / RAY) / 100; // -> percent with 2 decimals
    const aToken = (data.aTokenAddress && data.aTokenAddress !== "0x0000000000000000000000000000000000000000")
      ? data.aTokenAddress
      : ABAS_USDC;
    return { aToken, supplyApy };
  } catch {
    return null;
  }
}

/** Returns the user's interest-bearing aUSDC balance (principal + accrued interest), formatted USDC. */
export async function getAaveUsdcBalance(chainId: number, address: Address): Promise<number> {
  try {
    const reserve = await getAaveReserve(chainId);
    const aToken = reserve?.aToken ?? ABAS_USDC;
    const c = publicClientFor(chainId);
    const raw = (await c.readContract({ address: aToken, abi: aTokenAbi, functionName: "balanceOf", args: [address] })) as bigint;
    return Number(raw) / 1e6;
  } catch {
    return 0;
  }
}

/** Approve (if needed) then supply USDC into Aave V3. Returns the supply tx hash. */
export async function supplyUsdcToAave(chainId: number, pk: Hex, amount: string): Promise<Hex> {
  const pool = AAVE_POOL[chainId];
  const usdc = USDC[chainId];
  if (!pool || !usdc) throw new Error("Aave not available on this network");
  const account = accountFromPk(pk);
  const need = parseUnits(amount, 6);

  const allowance = await getAllowance(chainId, usdc, account.address, pool);
  if (allowance < need) {
    const approveHash = await approveErc20(chainId, pk, usdc, pool, amount, 6);
    await waitForTx(chainId, approveHash);
  }

  const wallet = createWalletClient({ account, transport: http(rpcFor(chainId)) });
  return wallet.writeContract({
    address: pool,
    abi: poolAbi,
    functionName: "supply",
    args: [usdc, need, account.address, 0],
    chain: null,
  });
}

/** Withdraw USDC from Aave V3. Pass "max" to withdraw the full balance. Returns the withdraw tx hash. */
export async function withdrawUsdcFromAave(chainId: number, pk: Hex, amount: string | "max"): Promise<Hex> {
  const pool = AAVE_POOL[chainId];
  const usdc = USDC[chainId];
  if (!pool || !usdc) throw new Error("Aave not available on this network");
  const account = accountFromPk(pk);
  const value = amount === "max" ? maxUint256 : parseUnits(amount, 6);
  const wallet = createWalletClient({ account, transport: http(rpcFor(chainId)) });
  return wallet.writeContract({
    address: pool,
    abi: poolAbi,
    functionName: "withdraw",
    args: [usdc, value, account.address],
    chain: null,
  });
}
