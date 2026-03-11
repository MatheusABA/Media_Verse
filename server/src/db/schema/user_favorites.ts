import { pgTable, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { media } from "./media";
import { users } from "./users";

export const userFavorites = pgTable(
  "user_favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    mediaId: uuid("media_id").notNull().references(() => media.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserFavorite: uniqueIndex("user_favorites_unique").on(table.userId, table.mediaId),
  })
);