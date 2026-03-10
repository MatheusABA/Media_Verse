import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  bio: text("bio"),
  avatarUrl: text("avatar_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})