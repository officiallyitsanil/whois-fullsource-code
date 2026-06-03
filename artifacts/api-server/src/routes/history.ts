import { Router, type IRouter } from "express";
import { pool, searchHistoryTable, db } from "@workspace/db";
import {
  GetSearchHistoryQueryParams,
  GetSearchHistoryResponse,
  GetPopularSearchesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/history", async (req, res): Promise<void> => {
  const queryParams = GetSearchHistoryQueryParams.safeParse(req.query);
  const limit = queryParams.success ? (queryParams.data.limit ?? 10) : 10;

  const result = await pool.query<{
    id: number;
    domain: string;
    searched_at: Date;
    ip_address: string | null;
  }>(
    `SELECT id, domain, searched_at, ip_address
     FROM search_history
     ORDER BY searched_at DESC
     LIMIT $1`,
    [limit]
  );

  const rows = result.rows.map((r) => ({
    id: r.id,
    domain: r.domain,
    searchedAt: r.searched_at.toISOString(),
    ipAddress: r.ip_address,
  }));

  res.json(GetSearchHistoryResponse.parse(rows));
});

router.get("/history/popular", async (_req, res): Promise<void> => {
  const result = await pool.query<{ domain: string; count: string }>(
    `SELECT domain, COUNT(id)::text AS count
     FROM search_history
     GROUP BY domain
     ORDER BY COUNT(id) DESC
     LIMIT 10`
  );

  const rows = result.rows.map((r) => ({
    domain: r.domain,
    count: parseInt(r.count, 10),
  }));

  res.json(GetPopularSearchesResponse.parse(rows));
});

// Keep db import to satisfy the workspace dep — avoids unused import errors
void searchHistoryTable;
void db;

export default router;
