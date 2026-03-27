import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth.plugin";
import { getDiscoverFeed, addVote, addComment } from "../services/discover.services";

export const discoverRoutes = new Elysia({ prefix: "/discover" })
  
  // 1. Pega o Feed global (Não exige token, mas se mandar a gente sabe se ele votou)
  // Como Elysia precisa de plugin pra usar o userId, tentamos decodificar manualmente se houver, 
  // mas pra não travar quem não tem login, criamos um bloco aberto
  .resolve(async ({ headers, jwt }: any) => {
      let userId = undefined;
      const authHeader = headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          const payload = await jwt.verify(token);
          if (payload && payload.userId) {
              userId = payload.userId;
          }
      }
      return { requesterId: userId };
  })
  .get("/", async ({ requesterId }) => {
    return await getDiscoverFeed(requesterId);
  })

  .use(authPlugin)

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