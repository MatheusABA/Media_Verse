import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth.plugin";
import { addFavorite, removeFavorite, getFavorites } from "../services/user_favorite.services";

export const userFavoriteRoutes = new Elysia({ prefix: "/user-favorites" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, userId }) => {
      const result = await addFavorite({ ...body, userId });
      return result;
    },
    {
      body: t.Object({
        tmdbId: t.String(),
        type: t.Union([t.Literal("movie"), t.Literal("tv")]),
        title: t.String(),
        posterUrl: t.Optional(t.Nullable(t.String())),
        releaseDate: t.Optional(t.Nullable(t.String())),
        description: t.Optional(t.Nullable(t.String())),
      }),
    }
  )
  .delete(
    "/:mediaId",
    async ({ params, userId }) => {
      const deleted = await removeFavorite(userId, params.mediaId);
      if (!deleted) return { error: "Não encontrado" };
      return { success: true };
    }
  )
  .get("/", async ({ userId }) => {
    return getFavorites(userId);
  });