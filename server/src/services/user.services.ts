import { db } from "../db/db"
import { users, reviews, media, userMedia, lists } from "../db/schema"
import { eq, and, count, desc } from "drizzle-orm"

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
}

export async function getUserProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
      location: true,
      createdAt: true,
    },
  })
  if (!user) return null

  const [[moviesWatched], [seriesWatched], [reviewsCount], [listsCount]] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(userMedia)
        .innerJoin(media, eq(userMedia.mediaId, media.id))
        .where(
          and(
            eq(userMedia.userId, userId),
            eq(media.type, "movie"),
            eq(userMedia.status, "watched")
          )
        ),
      db
        .select({ value: count() })
        .from(userMedia)
        .innerJoin(media, eq(userMedia.mediaId, media.id))
        .where(
          and(
            eq(userMedia.userId, userId),
            eq(media.type, "tv"),
            eq(userMedia.status, "watched")
          )
        ),
      db
        .select({ value: count() })
        .from(reviews)
        .innerJoin(userMedia, eq(reviews.userMediaId, userMedia.id))
        .where(eq(userMedia.userId, userId)),
      db
        .select({ value: count() })
        .from(lists)
        .where(eq(lists.userId, userId)),
    ])

  const reviewedColumns = {
    id: media.id,
    title: media.title,
    posterUrl: media.posterUrl,
    tmdbId: media.tmdbId,
    rating: userMedia.rating,
    reviewContent: reviews.content,
    reviewCreatedAt: reviews.createdAt,
  } as const

  const [reviewedMovies, reviewedSeries] = await Promise.all([
    db
      .select(reviewedColumns)
      .from(reviews)
      .innerJoin(userMedia, eq(reviews.userMediaId, userMedia.id))
      .innerJoin(media, eq(userMedia.mediaId, media.id))
      .where(and(eq(userMedia.userId, userId), eq(media.type, "movie")))
      .orderBy(reviews.createdAt),
    db
      .select(reviewedColumns)
      .from(reviews)
      .innerJoin(userMedia, eq(reviews.userMediaId, userMedia.id))
      .innerJoin(media, eq(userMedia.mediaId, media.id))
      .where(and(eq(userMedia.userId, userId), eq(media.type, "tv")))
      .orderBy(desc(reviews.createdAt)),
  ])

  return {
    user,
    stats: {
      moviesWatched: moviesWatched.value,
      seriesWatched: seriesWatched.value,
      reviewsCount: reviewsCount.value,
      listsCount: listsCount.value,
    },
    reviewedMovies,
    reviewedSeries,
  }
}