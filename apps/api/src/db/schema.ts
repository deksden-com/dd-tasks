import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const foundationMetadata = pgTable("foundation_metadata", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type FoundationMetadata = typeof foundationMetadata.$inferSelect;
