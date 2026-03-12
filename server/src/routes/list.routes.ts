import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth.plugin";
import {
  createList,
  getUserLists,
  getListById,
  deleteList,
  addMediaToList,
  getListItems,
  removeMediaFromList,
} from "../services/list.services";

export const listRoutes = new Elysia({ prefix: "/lists" })
  .use(authPlugin)

  // 1. Criar uma nova lista
  .post(
    "/",
    async ({ body, userId }) => {
      return await createList({
        userId,
        title: body.title,
        description: body.description,
        visibility: body.visibility as "public" | "private",
      });
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.Nullable(t.String())),
        visibility: t.Optional(t.Union([t.Literal("public"), t.Literal("private")])),
      }),
    }
  )

  // 2. Pegar todas as listas do usuário logado
  .get("/", async ({ userId }) => {
    return await getUserLists(userId);
  })

  // 3. Pegar uma lista específica e as mídias dentro dela
  .get("/:id", async ({ params, error }) => {
    const list = await getListById(params.id);
    if (!list) return error(404, "Lista não encontrada");

    const items = await getListItems(params.id);
    return { list, items };
  })

  // 4. Deletar uma lista inteira
  .delete("/:id", async ({ params, userId, error }) => {
    const list = await getListById(params.id);
    if (!list) return error(404, "Lista não encontrada");
    if (list.userId !== userId) return error(403, "Sem permissão"); // Não deixar deletar do amiguinho

    return await deleteList(params.id);
  })

  // 5. Adicionar um item (mídia) a uma lista
  .post(
    "/:id/items",
    async ({ params, body, userId, error }) => {
      const list = await getListById(params.id);
      if (!list) return error(404, "Lista não encontrada");
      if (list.userId !== userId) return error(403, "Sem permissão");

      return await addMediaToList(params.id, {
        tmdbId: body.tmdbId,
        type: body.type,
        title: body.title,
        posterUrl: body.posterUrl,
        releaseDate: body.releaseDate,
        description: body.description,
      });
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

  // 6. Remover uma mídia de uma lista (usa o ID do listItem gerado)
  .delete("/:id/items/:itemId", async ({ params, userId, error }) => {
    const list = await getListById(params.id);
    if (!list) return error(404, "Lista não encontrada");
    if (list.userId !== userId) return error(403, "Sem permissão");

    return await removeMediaFromList(params.itemId);
  });