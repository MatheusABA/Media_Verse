import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core"

export const mediaTypeEnum = pgEnum("media_type", [
  "movie",
  "tv"
])

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: text("title").notNull(),
  description: text("description"),

  type: mediaTypeEnum("type").notNull(),

  posterUrl: text("poster_url"),
  releaseDate: timestamp("release_date"),

  tmdbId: text("tmdb_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})