import { db } from "../db/db";
import { reviews } from "../db/schema/reviews";
import { userMedia } from "../db/schema/user_media";
import { media } from "../db/schema/media";
import { eq, and, count, desc, ilike } from "drizzle-orm";

export async function upsertReview({ userMediaId, content }: { userMediaId: string; content: string }) {
  const existing = await db.query.reviews.findFirst({
    where: eq(reviews.userMediaId, userMediaId),
  });

  if (existing) {
    const [updated] = await db
      .update(reviews)
      .set({ content })
      .where(eq(reviews.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(reviews)
    .values({ userMediaId, content })
    .returning();
  return created;
}

export async function getMyReviews(userId: string, page = 1, limit = 20) {
  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.max(1, Number(limit) || 20);
  const offset = (pageNum - 1) * perPage;

  // total count
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(reviews)
    .innerJoin(userMedia, eq(reviews.userMediaId, userMedia.id))
    .where(eq(userMedia.userId, userId));

  const items = await db
    .select({
      id: reviews.id,
      content: reviews.content,
      createdAt: reviews.createdAt,
      userMediaId: reviews.userMediaId,
      rating: userMedia.rating,
      status: userMedia.status,
      mediaId: media.id,
      title: media.title,
      posterUrl: media.posterUrl,
      type: media.type,
      tmdbId: media.tmdbId,
    })
    .from(reviews)
    .innerJoin(userMedia, eq(reviews.userMediaId, userMedia.id))
    .innerJoin(media, eq(userMedia.mediaId, media.id))
    .where(eq(userMedia.userId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(perPage)
    .offset(offset);

  const totalNum = Number(total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalNum / perPage));

  return {
    items,
    meta: {
      total: totalNum,
      page: pageNum,
      perPage,
      totalPages,
    },
  };
}

export async function getReviewByUserMedia(userMediaId: string) {
  const result = await db.query.reviews.findFirst({
    where: eq(reviews.userMediaId, userMediaId),
  });
  return result ?? null;
}

export async function deleteReview(id: string, userId: string) {
  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, id),
  });
  if (!review) return null;

  const um = await db.query.userMedia.findFirst({
    where: and(eq(userMedia.id, review.userMediaId), eq(userMedia.userId, userId)),
  });
  if (!um) return null;

  const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
  return deleted;
}

export async function getMyEvaluations(
  userId: string,
  page = 1,
  limit = 20,
  filters: { search?: string; type?: string; status?: string } = {}
) {
  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.max(1, Math.min(50, Number(limit) || 20));
  const offset = (pageNum - 1) * perPage;

  const conditions = [eq(userMedia.userId, userId)];
  if (filters.type) conditions.push(eq(media.type, filters.type));
  if (filters.status)
    conditions.push(eq(userMedia.status, filters.status as "watched" | "watching" | "plan_to_watch" | "dropped"));
  if (filters.search)
    conditions.push(ilike(media.title, `%${filters.search}%`));

  const where = and(...conditions);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(userMedia)
    .innerJoin(media, eq(userMedia.mediaId, media.id))
    .where(where);

  const items = await db
    .select({
      userMediaId: userMedia.id,
      status: userMedia.status,
      rating: userMedia.rating,
      addedAt: userMedia.createdAt,
      mediaId: media.id,
      title: media.title,
      posterUrl: media.posterUrl,
      type: media.type,
      tmdbId: media.tmdbId,
      reviewId: reviews.id,
      reviewContent: reviews.content,
      reviewCreatedAt: reviews.createdAt,
    })
    .from(userMedia)
    .innerJoin(media, eq(userMedia.mediaId, media.id))
    .leftJoin(reviews, eq(reviews.userMediaId, userMedia.id))
    .where(where)
    .orderBy(desc(userMedia.createdAt))
    .limit(perPage)
    .offset(offset);

  const totalNum = Number(total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalNum / perPage));

  return {
    items,
    meta: { total: totalNum, page: pageNum, perPage, totalPages },
  };
}