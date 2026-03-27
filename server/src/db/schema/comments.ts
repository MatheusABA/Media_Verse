import { pgTable, uuid, timestamp, text, index } from "drizzle-orm/pg-core"

import { users } from "./users"
import { reviews } from "./reviews"
import { lists } from "./lists"

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }),
  listId: uuid("list_id").references(() => lists.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
  reviewIdIdx: index("comment_review_id_idx").on(table.reviewId),
  listIdIdx: index("comment_list_id_idx").on(table.listId),
}))