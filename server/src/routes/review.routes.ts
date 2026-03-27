import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth.plugin";
import {
  upsertReview,
  getMyReviews,
  getReviewByUserMedia,
  deleteReview,
  getMyEvaluations,
} from "../services/review.services";

export const reviewRoutes = new Elysia({ prefix: "/reviews", tags: ["Review"] })
  .use(authPlugin)
  .post("/", async ({ body }) => {
    return upsertReview(body);
  }, {
    body: t.Object({
      userMediaId: t.String(),
      content: t.String(),
    }),
  })
  .get("/my", async (ctx) => {
    const page = ctx.query?.page ? Number(ctx.query.page) : 1;
    const limit = ctx.query?.limit ? Number(ctx.query.limit) : 20;
    return getMyReviews(ctx.userId, page, limit);
  })
  .get("/my-evaluations", async (ctx) => {
    const page = ctx.query?.page ? Number(ctx.query.page) : 1;
    const limit = ctx.query?.limit ? Number(ctx.query.limit) : 20;
    return getMyEvaluations(ctx.userId, page, limit, {
      search: ctx.query?.search || undefined,
      type: ctx.query?.type || undefined,
      status: ctx.query?.status || undefined,
    });
  })
  .get("/by-user-media/:userMediaId", async ({ params }) => {
    return getReviewByUserMedia(params.userMediaId);
  })
  .delete("/:id", async ({ params, userId }) => {
    const deleted = await deleteReview(params.id, userId);
    if (!deleted) return { error: "Não encontrado" };
    return { success: true };
  });