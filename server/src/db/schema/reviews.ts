import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core"

import { userMedia } from "./user_media"

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),

  userMediaId: uuid("user_media_id")
    .notNull()
    .references(() => userMedia.id),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
  userMediaIdIdx: index("reviews_user_media_id_idx").on(table.userMediaId),
}))