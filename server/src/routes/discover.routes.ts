import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth.plugin";
import { getDiscoverFeed, addVote, addComment } from "../services/discover.services";
// import { authRateLimit, publicRateLimit } from "../plugins/rate_limiting.plugin";
import jwt from "@elysiajs/jwt";

export const discoverRoutes = new Elysia({ prefix: "/discover", tags: ["Discover"] })
//   .use(publicRateLimit)
  // 1. Pega o Feed global (Não exige token, mas se mandar a gente sabe se ele votou)
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!}))
  .resolve(async ({ headers, jwt }) => {
      let requesterId: string | undefined = undefined;
      const authHeader = headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          const payload = await jwt.verify(token);
          if (payload && payload.sub) {
              requesterId = payload.sub as string;
          }
      }
      return { requesterId };
  })
  .get("/", async ({ requesterId }) => {
    return await getDiscoverFeed(requesterId);
  })

  .use(authPlugin)
//   .use(authRateLimit)
  // 2. Dar upvote ou downvote (-1, 0 remover ou 1)
  .post("/vote", async ({ userId, body }) => {
      const { targetId, type, value } = body;
      return await addVote(userId, type, targetId, value);
  }, {
      body: t.Object({
          targetId: t.String(),
          type: t.Union([t.Literal("review"), t.Literal("list")]),
          value: t.Number() // 1 ou -1 ou 0
      })
  })

  // 3. Adicionar um Comentário num post (review ou list)
  .post("/comment", async ({ userId, body }) => {
      const { targetId, type, content } = body;
      return await addComment(userId, type, targetId, content);
  }, {
      body: t.Object({
          targetId: t.String(),
          type: t.Union([t.Literal("review"), t.Literal("list")]),
          content: t.String()
      })
  });