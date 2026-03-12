import { Elysia, t } from "elysia"
import { authPlugin } from "../plugins/auth.plugin"
import {
  getUserTopMedia,
  setTopMediaEntry,
  removeTopMediaEntry,
} from "../services/user_top_media.services"

export const userTopMediaRoutes = new Elysia({ prefix: "/user-top-media" })
  .use(authPlugin)
  .get("/", async ({ userId }) => {
    return getUserTopMedia(userId)
  })
  .post(
    "/",
    async ({ userId, body }) => {
      return setTopMediaEntry(userId, body)
    },
    {
      body: t.Object({
        tmdbId: t.String(),
        type: t.Union([t.Literal("movie"), t.Literal("tv")]),
        title: t.String(),
        position: t.Number(),
        posterUrl: t.Optional(t.Nullable(t.String())),
        releaseDate: t.Optional(t.Nullable(t.String())),
        description: t.Optional(t.Nullable(t.String())),
      }),
    }
  )
  .delete("/:id", async ({ params, userId }) => {
    const deleted = await removeTopMediaEntry(params.id, userId)
    if (!deleted) return { error: "Não encontrado" }
    return { success: true }
  })