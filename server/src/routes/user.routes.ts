import { Elysia } from "elysia"
import { authPlugin } from "../plugins/auth.plugin"
import { db } from "../db/db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"

export const userRoutes = new Elysia({ prefix: "/user" })
  .use(authPlugin)
  .get("/me", async (ctx) => {
    const { userId } = (ctx)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      }
    })
    if (!user) return { error: "Usuário não encontrado" }
    return { user }
  })