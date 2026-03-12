import { db } from "../db/db";
import { reviews } from "../db/schema/reviews";
import { userMedia } from "../db/schema/user_media";
import { media } from "../db/schema/media";
import { eq, and } from "drizzle-orm";

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

export async function getMyReviews(userId: string) {
  return db
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
    .orderBy(reviews.createdAt);
}

export async function getReviewByUserMedia(userMediaId: string) {
  const result = await  db.query.reviews.findFirst({
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