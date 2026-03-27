import { pgTable, uuid, timestamp, uniqueIndex, index, smallint } from "drizzle-orm/pg-core"

import { users } from "./users"
import { reviews } from "./reviews"
import { lists } from "./lists"

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // O voto pertence a UMA review ou UMA lista
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }),
  listId: uuid("list_id").references(() => lists.id, { onDelete: "cascade" }),

  // 1 = Upvote, -1 = Downvote
  value: smallint("value").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
  // Garante que o usuário só consiga votar uma vez por review/lista
  uniqueReviewVoteIdx: uniqueIndex("unique_review_vote_idx").on(table.userId, table.reviewId),
  uniqueListVoteIdx: uniqueIndex("unique_list_vote_idx").on(table.userId, table.listId),
  
  // Índices para performance
  reviewIdIdx: index("vote_review_id_idx").on(table.reviewId),
  listIdIdx: index("vote_list_id_idx").on(table.listId),
}))