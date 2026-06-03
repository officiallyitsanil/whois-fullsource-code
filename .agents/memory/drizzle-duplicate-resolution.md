---
name: Drizzle ORM duplicate pnpm resolution type errors
description: When pnpm resolves two drizzle-orm instances, SQL types are incompatible; escape hatch is pool.query()
---

When installing packages that have pg as a peer dependency alongside packages that don't, pnpm can resolve two copies of drizzle-orm: `drizzle-orm@0.45.2` and `drizzle-orm@0.45.2_@types+pg@8.20.0_pg@8.20.0`. These have incompatible private properties (`shouldInlineParams`) causing TS errors like:
```
Type 'SQL<unknown>' is not assignable to type 'SQL<unknown>'
Types have separate declarations of a private property 'shouldInlineParams'
```

**Why:** The `drizzle-orm` catalog entry resolves differently for packages that have pg in their dep tree vs those that don't. The `sql` tagged template, `desc()`, `count()` functions etc. come from different module instances.

**How to apply:** 
- For routes in api-server that do simple queries (ORDER BY, GROUP BY, COUNT), use the pg `pool` directly from `@workspace/db`:
```typescript
import { pool } from "@workspace/db";
const result = await pool.query<RowType>("SELECT ... ORDER BY x DESC LIMIT $1", [limit]);
```
- This bypasses the drizzle query builder entirely for those routes and avoids the type conflict.
- The conflict only affects the api-server; lib/db itself uses the peer-dep-resolved version consistently.
