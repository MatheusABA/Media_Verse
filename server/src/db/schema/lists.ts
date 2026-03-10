import { pgTable, uuid, timestamp, uniqueIndex, index, pgEnum, text } from "drizzle-orm/pg-core"

import { users } from "./users"

export const listVisibilityEnum = pgEnum("list_visibility", ["public", "private"])

export const lists = pgTable("lists", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  title: text("title").notNull(),
  description: text("description"),

  visibility: listVisibilityEnum("visibility").default("public"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
  userIdIdx: index("lists_user_id_idx").on(table.userId),
}))