---
name: whois package Node.js 24 compatibility
description: whois-json is broken on Node.js 24; correct whois package usage pattern
---

The `whois-json@2.0.4` package has a bug where it assigns to an undeclared global `log` variable (comma-separated var declaration missing a comma), which throws `ReferenceError: log is not defined` in Node.js 24 strict mode.

**Why:** whois-json uses `var util = require('util'), whois = require('whois')` then on the next line `log = console.log.bind(console),` — missing the comma on the `whois` line makes `log` a standalone undeclared assignment.

**How to apply:** Use the `whois` package directly instead. It uses named ESM exports — always import as:
```typescript
import * as whois from "whois";
```
NOT `import whois from "whois"` (no default export — esbuild will throw "No matching export for import default").

Use a manual Promise wrapper since the callback types don't support options well with promisify:
```typescript
function whoisLookupPromise(domain: string, options: object): Promise<string> {
  return new Promise((resolve, reject) => {
    whois.lookup(domain, options, (err, data) => {
      if (err) { reject(err); return; }
      resolve(typeof data === "string" ? data : (data as {data:string}[]).map(d => d.data).join("\n\n"));
    });
  });
}
```
