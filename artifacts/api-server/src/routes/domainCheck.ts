import { Router, type IRouter } from "express";
import { checkDomainAvailability } from "../lib/whoisParser";
import {
  GetDomainAvailabilityParams,
  GetDomainAvailabilityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const TLDS = [".com", ".net", ".org", ".io", ".ai", ".co", ".dev", ".app"];

router.get("/domain-check/:domain", async (req, res): Promise<void> => {
  const params = GetDomainAvailabilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid domain parameter" });
    return;
  }

  const rawDomain = Array.isArray(params.data.domain)
    ? params.data.domain[0]
    : params.data.domain;

  // Extract just the base name (no TLD)
  const cleaned = rawDomain.trim().toLowerCase().replace(/^www\./, "");
  const baseName = cleaned.split(".")[0];

  if (!baseName) {
    res.status(400).json({ error: "Invalid domain name" });
    return;
  }

  const checks = await Promise.all(
    TLDS.map(async (tld) => {
      const domain = `${baseName}${tld}`;
      const available = await checkDomainAvailability(domain);
      return { tld, available, domain };
    })
  );

  const result = {
    baseDomain: baseName,
    results: checks,
  };

  res.json(GetDomainAvailabilityResponse.parse(result));
});

export default router;
