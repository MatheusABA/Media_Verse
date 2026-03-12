import { db } from "../db/db";
import { userFavorites, media } from "../db/schema";
import { eq, desc, and, count, ilike } from "drizzle-orm";

type FavoriteInput = {
  userId: string;
  tmdbId: string;
  type: "movie" | "tv";
  title: string;
  posterUrl?: string | null;
  releaseDate?: string | null;
  description?: string | null;
};

async function findOrCreateMedia(input: FavoriteInput) {
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

export async function addFavorite(input: FavoriteInput) {
  const mediaRecord = await findOrCreateMedia(input);

  const existing = await db.query.userFavorites.findFirst({
    where: and(
      eq(userFavorites.userId, input.userId),
      eq(userFavorites.mediaId, mediaRecord.id)
    ),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(userFavorites)
    .values({
      userId: input.userId,
      mediaId: mediaRecord.id,
    })
    .returning();
  return created;
}

export async function removeFavorite(userId: string, mediaId: string) {
  const existing = await db.query.userFavorites.findFirst({
    where: and(
      eq(userFavorites.userId, userId),
      eq(userFavorites.mediaId, mediaId)
    ),
  });
  if (!existing) return null;

  await db.delete(userFavorites).where(
    and(
      eq(userFavorites.userId, userId),
      eq(userFavorites.mediaId, mediaId)
    )
  );
  return existing;
}

export async function getFavorites(userId: string) {
  return db
    .select({
      id: userFavorites.id,
      createdAt: userFavorites.createdAt,
      mediaId: media.id,
      title: media.title,
      type: media.type,
      posterUrl: media.posterUrl,
      tmdbId: media.tmdbId,
      description: media.description,
      releaseDate: media.releaseDate,
    })
    .from(userFavorites)
    .innerJoin(media, eq(userFavorites.mediaId, media.id))
    .where(eq(userFavorites.userId, userId))
    .orderBy(desc(userFavorites.createdAt));
}

export async function getUserFavorites(userId, page = 1, limit = 20, type, search) {
  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.max(1, Math.min(50, Number(limit) || 20));
  const offset = (pageNum - 1) * perPage;

  const where = [eq(userFavorites.userId, userId)];
  if (type) where.push(eq(media.type, type));
  if (search) where.push(ilike(media.title, `%${search}%`));

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(userFavorites)
    .innerJoin(media, eq(userFavorites.mediaId, media.id))
    .where(where.length > 1 ? and(...where) : where[0]);

  const items = await db
    .select({
      id: userFavorites.id,
      mediaId: media.id,
      title: media.title,
      posterUrl: media.posterUrl,
      type: media.type,
      tmdbId: media.tmdbId,
      createdAt: userFavorites.createdAt,
    })
    .from(userFavorites)
    .innerJoin(media, eq(userFavorites.mediaId, media.id))
    .where(where.length > 1 ? and(...where) : where[0])
    .orderBy(desc(userFavorites.createdAt))
    .limit(perPage)
    .offset(offset);

  const totalNum = Number(total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalNum / perPage));

  return {
    items,
    meta: { total: totalNum, page: pageNum, perPage, totalPages },
  };
}