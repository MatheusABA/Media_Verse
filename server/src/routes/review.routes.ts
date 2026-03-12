import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth.plugin";
import {
  upsertReview,
  getMyReviews,
  getReviewByUserMedia,
  deleteReview,
} from "../services/review.services";

export const reviewRoutes = new Elysia({ prefix: "/reviews" })
  .use(authPlugin)
  .post("/", async ({ body }) => {
    return upsertReview(body);
  }, {
    body: t.Object({
      userMediaId: t.String(),
      content: t.String(),
    }),
  })
  .get("/my", async ({ userId }) => {
    return getMyReviews(userId);
  })
  .get("/by-user-media/:userMediaId", async ({ params }) => {
    return getReviewByUserMedia(params.userMediaId);
  })
  .delete("/:id", async ({ params, userId }) => {
    const deleted = await deleteReview(params.id, userId);
    if (!deleted) return { error: "Não encontrado" };
    return { success: true };
  });