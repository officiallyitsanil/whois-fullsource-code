import { Router, type IRouter } from "express";
import { lookupWhois } from "../lib/whoisParser";
import { db, searchHistoryTable } from "@workspace/db";
import {
  GetWhoisParams,
  GetWhoisResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/whois/:domain", async (req, res): Promise<void> => {
  const params = GetWhoisParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid domain parameter" });
    return;
  }

  const rawDomain = Array.isArray(params.data.domain)
    ? params.data.domain[0]
    : params.data.domain;

  // Strip protocol and path
  let domain = rawDomain.trim().toLowerCase();
  try {
    const withProtocol = domain.includes("://") ? domain : `https://${domain}`;
    const url = new URL(withProtocol);
    domain = url.hostname.replace(/^www\./, "");
  } catch {
    domain = domain.replace(/^www\./, "").split("/")[0];
  }

  try {
    const result = await lookupWhois(domain);

    // Save search history (non-blocking)
    const ipAddress =
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        ?.trim() ||
      req.socket.remoteAddress ||
      null;

    db.insert(searchHistoryTable)
      .values({ domain, ipAddress })
      .execute()
      .catch(() => {});

    res.json(GetWhoisResponse.parse(result));
  } catch (err) {
    req.log.error({ err, domain }, "WHOIS lookup failed");
    res.status(500).json({ error: "WHOIS lookup failed. Please try again." });
  }
});

export default router;
