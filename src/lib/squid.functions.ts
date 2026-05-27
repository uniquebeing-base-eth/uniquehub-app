import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SQUID_BASE = "https://v2.api.squidrouter.com/v2";

const RouteInput = z.object({
  fromAddress: z.string().min(10),
  fromChain: z.string(),
  fromToken: z.string(),
  fromAmount: z.string(),
  toChain: z.string(),
  toToken: z.string(),
  toAddress: z.string().min(10),
});

export const getSquidRoute = createServerFn({ method: "POST" })
  .inputValidator((d) => RouteInput.parse(d))
  .handler(async ({ data }) => {
    const integratorId = process.env.SQUID_INTEGRATOR_ID;
    if (!integratorId) throw new Error("Squid integrator ID not configured");
    const res = await fetch(`${SQUID_BASE}/route`, {
      method: "POST",
      headers: {
        "x-integrator-id": integratorId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const requestId = res.headers.get("x-request-id");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.message || body?.errors?.[0]?.message || `Squid route failed (${res.status})`);
    }
    return { route: body.route, requestId };
  });

const StatusInput = z.object({
  transactionId: z.string(),
  requestId: z.string().optional(),
  fromChainId: z.string(),
  toChainId: z.string(),
  quoteId: z.string().optional(),
});

export const getSquidStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => StatusInput.parse(d))
  .handler(async ({ data }) => {
    const integratorId = process.env.SQUID_INTEGRATOR_ID;
    if (!integratorId) throw new Error("Squid integrator ID not configured");
    const params = new URLSearchParams();
    params.set("transactionId", data.transactionId);
    if (data.requestId) params.set("requestId", data.requestId);
    params.set("fromChainId", data.fromChainId);
    params.set("toChainId", data.toChainId);
    if (data.quoteId) params.set("quoteId", data.quoteId);
    const res = await fetch(`${SQUID_BASE}/status?${params}`, {
      headers: { "x-integrator-id": integratorId },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.message || `Squid status failed (${res.status})`);
    return body;
  });