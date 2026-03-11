import { db } from "../db/db";
import { media, userMedia } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

type CreateUserMediaInput = {
  userId: string;
  tmdbId: string;
  type: "movie" | "tv";
  title: string;
  posterUrl?: string | null;
  releaseDate?: string | null;
  description?: string | null;
  status: "plan_to_watch" | "watching" | "watched" | "dropped";
  rating?: string | null;
  watchedAt?: string | null;
};

async function findOrCreateMedia(input: CreateUserMediaInput) {
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

export async function createOrUpdateUserMedia(input: CreateUserMediaInput) {
  const mediaRecord = await findOrCreateMedia(input);

  const existing = await db.query.userMedia.findFirst({
    where: and(
      eq(userMedia.userId, input.userId),
      eq(userMedia.mediaId, mediaRecord.id),
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(userMedia)
      .set({
        status: input.status,
        rating: input.rating ?? existing.rating,
        watchedAt: input.watchedAt ? new Date(input.watchedAt) : existing.watchedAt,
      })
      .where(eq(userMedia.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(userMedia)
    .values({
      userId: input.userId,
      mediaId: mediaRecord.id,
      status: input.status,
      rating: input.rating ?? null,
      watchedAt: input.watchedAt ? new Date(input.watchedAt) : null,
    })
    .returning();
  return created;
}

export async function getUserMediaList(userId: string, status?: string, type?: string) {
  let query = db
    .select({
      id: userMedia.id,
      status: userMedia.status,
      rating: userMedia.rating,
      watchedAt: userMedia.watchedAt,
      createdAt: userMedia.createdAt,
      mediaId: media.id,
      title: media.title,
      type: media.type,
      posterUrl: media.posterUrl,
      tmdbId: media.tmdbId,
    })
    .from(userMedia)
    .innerJoin(media, eq(userMedia.mediaId, media.id))
    .where(eq(userMedia.userId, userId))
    .orderBy(desc(userMedia.createdAt))
    .$dynamic();

  const results = await query;

  return results.filter((r) => {
    if (status && r.status !== status) return false;
    if (type && r.type !== type) return false;
    return true;
  });
}

export async function deleteUserMedia(id: string, userId: string) {
  const existing = await db.query.userMedia.findFirst({
    where: and(eq(userMedia.id, id), eq(userMedia.userId, userId)),
  });
  if (!existing) return null;

  await db.delete(userMedia).where(eq(userMedia.id, id));
  return existing;
}