import { pgTable, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core"

import { users } from "./users"

export const follows = pgTable("follows", {
  id: uuid("id").primaryKey().defaultRandom(),

  followerId: uuid("follower_id")
    .notNull()
    .references(() => users.id),

  followingId: uuid("following_id")
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
  uniqueFollow: uniqueIndex("follows_unique").on(table.followerId, table.followingId),
  followerIdIdx: index("follows_follower_id_idx").on(table.followerId),
  followingIdIdx: index("follows_following_id_idx").on(table.followingId),
}))