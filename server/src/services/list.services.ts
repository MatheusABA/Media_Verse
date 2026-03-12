import { db } from "../db/db";
import { lists, listItems, media } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

type CreateListInput = {
  userId: string;
  title: string;
  description?: string | null;
  visibility?: "public" | "private";
};

type AddMediaToListInput = {
  tmdbId: string;
  type: "movie" | "tv";
  title: string;
  posterUrl?: string | null;
  releaseDate?: string | null;
  description?: string | null;
};

// --- Funções de Listas ---

export async function createList(input: CreateListInput) {
  const [created] = await db
    .insert(lists)
    .values({
      userId: input.userId,
      title: input.title,
      description: input.description ?? null,
      visibility: input.visibility ?? "public",
    })
    .returning();
  return created;
}

export async function getUserLists(userId: string) {
  return await db.query.lists.findMany({
    where: eq(lists.userId, userId),
    orderBy: [desc(lists.createdAt)],
  });
}

export async function getListById(listId: string) {
  return await db.query.lists.findFirst({
    where: eq(lists.id, listId),
  });
}

export async function deleteList(listId: string) {
  // O Drizzle pode reclamar de foreign key constraints
  // Portanto, deletamos os itens da lista antes para evitar erros.
  await db.delete(listItems).where(eq(listItems.listId, listId));

  const [deleted] = await db
    .delete(lists)
    .where(eq(lists.id, listId))
    .returning();
  return deleted;
}

// --- Funções de Itens da Lista ---

async function findOrCreateMedia(input: AddMediaToListInput) {
  const existing = await db.query.media.findFirst({
    where: and(eq(media.tmdbId, input.tmdbId), eq(media.type, input.type)),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(media)
    .values({
      title: input.title,
      type: input.type,
      tmdbId: input.tmdbId,
      posterUrl: input.posterUrl ?? null,
      description: input.description ?? null,
      releaseDate: input.releaseDate ? new Date(input.releaseDate) : null,
    })
    .returning();
  return created;
}

export async function addMediaToList(listId: string, input: AddMediaToListInput) {
  const mediaRecord = await findOrCreateMedia(input);

  // Evitar adicionar duplicado na mesma lista
  const existing = await db.query.listItems.findFirst({
    where: and(
      eq(listItems.listId, listId),
      eq(listItems.mediaId, mediaRecord.id)
    ),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(listItems)
    .values({
      listId,
      mediaId: mediaRecord.id,
    })
    .returning();

  return created;
}

export async function getListItems(listId: string) {
  // Aqui fazemos um JOIN para buscar as informações dos filmes/séries associados
  return await db
    .select({
      id: listItems.id,
      listId: listItems.listId,
      mediaId: listItems.mediaId,
      createdAt: listItems.createdAt,
      media: {
        id: media.id,
        title: media.title,
        type: media.type,
        posterUrl: media.posterUrl,
        tmdbId: media.tmdbId,
      },
    })
    .from(listItems)
    .innerJoin(media, eq(listItems.mediaId, media.id))
    .where(eq(listItems.listId, listId))
    .orderBy(desc(listItems.createdAt));
}

export async function removeMediaFromList(itemId: string) {
  const [deleted] = await db
    .delete(listItems)
    .where(eq(listItems.id, itemId))
    .returning();
  return deleted;
}