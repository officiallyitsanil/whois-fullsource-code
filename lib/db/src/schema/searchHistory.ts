import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const searchHistoryTable = pgTable("search_history", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  searchedAt: timestamp("searched_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistoryTable).omit({
  id: true,
  searchedAt: true,
});
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistoryTable.$inferSelect;
