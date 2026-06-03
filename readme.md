# DomainIQ — WHOIS Lookup Platform

A premium WHOIS lookup tool for developers, domain investors, and IT professionals. Instant domain intelligence: WHOIS data, DNS records, TLD availability, and search history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/whois-lookup run dev` — run the frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter, TanStack Query, Tailwind CSS + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- WHOIS: `whois` package (named ESM exports — import as `import * as whois from "whois"`)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/searchHistory.ts` — search_history table
- `artifacts/api-server/src/routes/` — whois.ts, dns.ts, domainCheck.ts, history.ts
- `artifacts/api-server/src/lib/whoisParser.ts` — WHOIS lookup + domain availability logic
- `artifacts/whois-lookup/src/` — React frontend (pages: Home, WhoisResults, History)

## Architecture decisions

- WHOIS parsing uses the `whois` package directly (not `whois-json` which has a Node.js 24 bug with undeclared `log` variable)
- `whois` package uses named ESM exports — must use `import * as whois from "whois"`, not default import
- Drizzle ORM duplicate resolution conflict: history routes use `pool.query()` (raw pg) instead of Drizzle query builder to avoid `drizzle-orm@0.45.2` vs `drizzle-orm@0.45.2_@types+pg` type mismatch
- Domain availability checking is done via WHOIS lookup + heuristic detection (creation date / registrar presence)
- Search history is written non-blocking (fire-and-forget) in the WHOIS route

## Product

- Homepage with hero search, recent search history feed, feature badges
- WHOIS results page: registrar, dates, status badges, nameservers, country, domain age — plus DNS records (A/AAAA/MX/TXT/NS/CNAME) and TLD availability tabs
- History page: full searchable list of past domain lookups
- Dark/light mode toggle

## Gotchas

- Do NOT use `whois-json` — it is incompatible with Node.js 24
- The `whois` package: always `import * as whois from "whois"` (named exports only)
- Drizzle query builder imports (`desc`, `count`, `sql`) cause type errors in the api-server when there are two drizzle-orm resolutions — use `pool.query()` for raw SQL in those cases
- After each OpenAPI spec change, re-run `pnpm --filter @workspace/api-spec run codegen`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
