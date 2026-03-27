import { Elysia } from "elysia"
import { authPlugin } from "../plugins/auth.plugin"
import { getUserById, getUserProfile } from "../services/user.services"

export const userRoutes = new Elysia({ prefix: "/user", tags: ["User"] })
  .use(authPlugin)
  .get("/me", async (ctx) => {
    const { userId } = ctx
    const user = await getUserById(userId)
    if (!user) return { error: "Usuário não encontrado" }
    return { user }
  })
  .get("/me/profile", async (ctx) => {
    const { userId } = ctx
    const profile = await getUserProfile(userId)
    if (!profile) return { error: "Usuário não encontrado" }
    return profile
  })