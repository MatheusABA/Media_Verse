import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

import { lists } from "./lists"
import { media } from "./media"

export const listItems = pgTable("list_items", {
  id: uuid("id").primaryKey().defaultRandom(),

  listId: uuid("list_id")
    .notNull()
    .references(() => lists.id),

  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
  uniqueListMedia: uniqueIndex("list_items_unique").on(table.listId, table.mediaId),
  listIdIdx: index("list_items_list_id_idx").on(table.listId),
})) 