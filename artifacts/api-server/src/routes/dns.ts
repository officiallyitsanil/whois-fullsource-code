import { Router, type IRouter } from "express";
import dns from "dns/promises";
import {
  GetDnsParams,
  GetDnsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface DnsRecord {
  type: string;
  value: string;
  ttl?: number | null;
  priority?: number | null;
}

async function safeResolve<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

router.get("/dns/:domain", async (req, res): Promise<void> => {
  const params = GetDnsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid domain parameter" });
    return;
  }

  const rawDomain = Array.isArray(params.data.domain)
    ? params.data.domain[0]
    : params.data.domain;
  const domain = rawDomain.trim().toLowerCase().replace(/^www\./, "");

  const [aRecords, aaaaRecords, mxRecords, txtRecords, nsRecords] =
    await Promise.all([
      safeResolve(() => dns.resolve4(domain, { ttl: true })),
      safeResolve(() => dns.resolve6(domain, { ttl: true })),
      safeResolve(() => dns.resolveMx(domain)),
      safeResolve(() => dns.resolveTxt(domain)),
      safeResolve(() => dns.resolveNs(domain)),
    ]);

  const A: DnsRecord[] = (aRecords || []).map((r) => ({
    type: "A",
    value: typeof r === "string" ? r : r.address,
    ttl: typeof r === "object" && "ttl" in r ? (r as { address: string; ttl: number }).ttl : null,
  }));

  const AAAA: DnsRecord[] = (aaaaRecords || []).map((r) => ({
    type: "AAAA",
    value: typeof r === "string" ? r : (r as { address: string; ttl: number }).address,
    ttl: typeof r === "object" && "ttl" in r ? (r as { address: string; ttl: number }).ttl : null,
  }));

  const MX: DnsRecord[] = (mxRecords || []).map((r) => ({
    type: "MX",
    value: r.exchange,
    priority: r.priority,
    ttl: null,
  }));

  const TXT: DnsRecord[] = (txtRecords || []).map((r) => ({
    type: "TXT",
    value: r.join(" "),
    ttl: null,
  }));

  const NS: DnsRecord[] = (nsRecords || []).map((r) => ({
    type: "NS",
    value: r,
    ttl: null,
  }));

  // CNAME lookup — only works on CNAME-only domains
  let CNAME: DnsRecord[] = [];
  const cnameResult = await safeResolve(() => dns.resolveCname(domain));
  if (cnameResult) {
    CNAME = cnameResult.map((r) => ({ type: "CNAME", value: r, ttl: null }));
  }

  const result = {
    domain,
    A,
    AAAA,
    MX,
    TXT,
    NS,
    CNAME,
  };

  res.json(GetDnsResponse.parse(result));
});

export default router;
