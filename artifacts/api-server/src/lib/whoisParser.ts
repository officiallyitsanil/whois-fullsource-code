import * as whois from "whois";

export interface ParsedWhois {
  domainName: string | null;
  registrar: string | null;
  registrarUrl: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  expiresDate: string | null;
  status: string[];
  nameservers: string[];
  registrantCountry: string | null;
  domainAge: number | null;
  rawText: string | null;
}

function whoisLookupPromise(
  domain: string,
  options: Parameters<typeof whois.lookup>[1]
): Promise<string> {
  return new Promise((resolve, reject) => {
    whois.lookup(domain, options as object, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      if (typeof data === "string") {
        resolve(data);
      } else if (Array.isArray(data)) {
        // verbose mode returns array of {server, data}
        resolve(data.map((d) => d.data).join("\n\n"));
      } else {
        resolve(String(data));
      }
    });
  });
}

function extractField(raw: string, ...keys: string[]): string | null {
  for (const key of keys) {
    const regex = new RegExp(`^${key}\\s*:\\s*(.+)$`, "im");
    const match = raw.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractAllFields(raw: string, ...keys: string[]): string[] {
  const results: string[] = [];
  for (const key of keys) {
    const regex = new RegExp(`^${key}\\s*:\\s*(.+)$`, "gim");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(raw)) !== null) {
      const val = match[1].trim().toLowerCase();
      if (val && !results.includes(val)) {
        results.push(val);
      }
    }
  }
  return results;
}

export async function lookupWhois(domain: string): Promise<ParsedWhois> {
  const rawText = await whoisLookupPromise(domain, {
    follow: 3,
    timeout: 15000,
  });

  const domainName =
    extractField(rawText, "Domain Name", "domain name", "domain") || domain;

  const registrar = extractField(rawText, "Registrar", "registrar name");

  const registrarUrl = extractField(
    rawText,
    "Registrar URL",
    "Registrar WHOIS Server",
    "registrar whois server"
  );

  const createdDate = extractField(
    rawText,
    "Creation Date",
    "Created Date",
    "created",
    "Registration Date",
    "Domain Registration Date"
  );

  const updatedDate = extractField(
    rawText,
    "Updated Date",
    "Last Modified",
    "Last Updated",
    "modified"
  );

  const expiresDate = extractField(
    rawText,
    "Registry Expiry Date",
    "Registrar Registration Expiration Date",
    "Expiry Date",
    "Expiration Date",
    "expires",
    "paid-till"
  );

  const status = extractAllFields(rawText, "Domain Status", "Status");
  const nameservers = extractAllFields(
    rawText,
    "Name Server",
    "Nameserver",
    "nserver"
  );

  const registrantCountry = extractField(
    rawText,
    "Registrant Country",
    "country"
  );

  let domainAge: number | null = null;
  if (createdDate) {
    try {
      const created = new Date(createdDate);
      if (!isNaN(created.getTime())) {
        domainAge = Math.floor(
          (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    } catch {
      domainAge = null;
    }
  }

  return {
    domainName: domainName ? domainName.toUpperCase() : null,
    registrar,
    registrarUrl,
    createdDate,
    updatedDate,
    expiresDate,
    status,
    nameservers,
    registrantCountry,
    domainAge,
    rawText,
  };
}

export async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    const rawText = await whoisLookupPromise(domain, {
      follow: 2,
      timeout: 10000,
    });

    const notFoundPatterns =
      /no match|not found|no entries found|object does not exist|no data found|is available|status: free|no object found/i;

    if (notFoundPatterns.test(rawText)) {
      return true;
    }

    const registrar = extractField(rawText, "Registrar");
    const creationDate = extractField(
      rawText,
      "Creation Date",
      "Created Date",
      "created"
    );
    const domainName = extractField(rawText, "Domain Name");

    return !registrar && !creationDate && !domainName;
  } catch {
    return true;
  }
}
