import { pgTable, uuid, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { users } from "./users"
import { media, mediaTypeEnum } from "./media"

export const userTopMedia = pgTable(
  "user_top_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    mediaId: uuid("media_id").notNull().references(() => media.id),
    type: mediaTypeEnum("type").notNull(),
    position: integer("position").notNull(), // 1 to 5
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquePosition: uniqueIndex("user_top_media_position_unique").on(
      table.userId,
      table.type,
      table.position
    ),
    uniqueMedia: uniqueIndex("user_top_media_media_unique").on(
      table.userId,
      table.mediaId
    ),
  })
)