import { db } from "../db/db"
import { userTopMedia, media } from "../db/schema"
import { eq, and, or } from "drizzle-orm"

type TopMediaInput = {
  tmdbId: string
  type: "movie" | "tv"
  title: string
  posterUrl?: string | null
  releaseDate?: string | null
  description?: string | null
  position: number
}

async function findOrCreateMedia(input: TopMediaInput) {
  const existing = await db.query.media.findFirst({
    where: and(eq(media.tmdbId, input.tmdbId), eq(media.type, input.type)),
  })
  if (existing) return existing

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
    .returning()
  return created
}

export async function getUserTopMedia(userId: string) {
  const rows = await db
    .select({
      id: userTopMedia.id,
      type: userTopMedia.type,
      position: userTopMedia.position,
      mediaId: media.id,
      title: media.title,
      posterUrl: media.posterUrl,
      tmdbId: media.tmdbId,
    })
    .from(userTopMedia)
    .innerJoin(media, eq(userTopMedia.mediaId, media.id))
    .where(eq(userTopMedia.userId, userId))
    .orderBy(userTopMedia.position)

  return {
    movies: rows.filter((r) => r.type === "movie"),
    series: rows.filter((r) => r.type === "tv"),
  }
}

export async function setTopMediaEntry(userId: string, input: TopMediaInput) {
  if (input.position < 1 || input.position > 5) {
    throw new Error("A posição deve ser entre 1 e 5")
  }

  const mediaRecord = await findOrCreateMedia(input)

  await db.delete(userTopMedia).where(
    and(
      eq(userTopMedia.userId, userId),
      or(
        and(
          eq(userTopMedia.type, input.type),
          eq(userTopMedia.position, input.position)
        ),
        eq(userTopMedia.mediaId, mediaRecord.id)
      )
    )
  )

  const [created] = await db
    .insert(userTopMedia)
    .values({
      userId,
      mediaId: mediaRecord.id,
      type: input.type,
      position: input.position,
    })
    .returning()
  return created
}

export async function removeTopMediaEntry(id: string, userId: string) {
  const existing = await db.query.userTopMedia.findFirst({
    where: and(eq(userTopMedia.id, id), eq(userTopMedia.userId, userId)),
  })
  if (!existing) return null

  const [deleted] = await db
    .delete(userTopMedia)
    .where(eq(userTopMedia.id, id))
    .returning()
  return deleted
}