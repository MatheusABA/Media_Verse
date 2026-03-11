import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth.plugin";
import {
  createOrUpdateUserMedia,
  getUserMediaList,
  deleteUserMedia,
} from "../services/user_media.services";

export const userMediaRoutes = new Elysia({ prefix: "/user-media" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, userId }) => {
      const result = await createOrUpdateUserMedia({
        userId,
        tmdbId: body.tmdbId,
        type: body.type,
        title: body.title,
        posterUrl: body.posterUrl,
        releaseDate: body.releaseDate,
        description: body.description,
        status: body.status,
        rating: body.rating,
        watchedAt: body.watchedAt,
      });
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
        status: t.Union([
          t.Literal("plan_to_watch"),
          t.Literal("watching"),
          t.Literal("watched"),
          t.Literal("dropped"),
        ]),
        rating: t.Optional(t.Nullable(t.String())),
        watchedAt: t.Optional(t.Nullable(t.String())),
      }),
    },
  )
  .get("/", async ({ userId, query }) => {
    return getUserMediaList(userId, query.status, query.type);
  })
  .delete("/:id", async ({ params, userId }) => {
    const deleted = await deleteUserMedia(params.id, userId);
    if (!deleted) return { error: "Não encontrado" };
    return { success: true };
  });