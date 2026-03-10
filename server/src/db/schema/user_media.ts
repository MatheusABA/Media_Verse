import {
  pgTable,
  uuid,
  timestamp,
  numeric,
  text,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"

import { users } from "./users"
import { media } from "./media"

export const userMediaStatusEnum = pgEnum("user_media_status", [
  "plan_to_watch",
  "watching",
  "watched",
  "dropped",
])

export const userMedia = pgTable("user_media", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id),

  status: userMediaStatusEnum("status"),

  rating: numeric("rating", { precision: 3, scale: 1 }),

  watchedAt: timestamp("watched_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
  uniqueUserMedia: uniqueIndex("user_media_unique").on(table.userId, table.mediaId),
  userIdIdx: index("user_media_user_id_idx").on(table.userId),
  mediaIdIdx: index("user_media_media_id_idx").on(table.mediaId),
}))